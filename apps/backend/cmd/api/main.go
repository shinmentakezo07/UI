package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"dra-platform/backend/internal/config"
	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/handler"
	appmiddleware "dra-platform/backend/internal/middleware"
	"dra-platform/backend/internal/pkg/logger"
	"dra-platform/backend/internal/provider"
	"dra-platform/backend/internal/repository"
	"dra-platform/backend/internal/service"
	"dra-platform/backend/pkg/llm/cache"
	"dra-platform/backend/pkg/llm/watcher"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config load failed: %v\n", err)
		os.Exit(1)
	}

	if cfg.IsDevelopment() {
		logger.SetLevel(slog.LevelDebug)
	}
	logger.Info("starting server", "env", cfg.Env, "port", cfg.Port)

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		logger.Error("database connection failed", "error", err.Error())
		os.Exit(1)
	}
	defer database.Close()

	// Repositories
	userRepo := repository.NewUserRepo(database)
	keyRepo := repository.NewAPIKeyRepo(database)
	creditsRepo := repository.NewCreditsRepo(database)
	txRepo := repository.NewTransactionRepo(database)
	logRepo := repository.NewLogRepo(database)

	// Provider registry with optional SDK features
	var llmCache cache.Cache
	if cfg.EnableCache {
		llmCache = cache.NewMemoryCache(
			cache.WithMaxSize(cfg.CacheMaxSize),
			cache.WithDefaultTTL(cfg.CacheDefaultTTL),
		)
		llmCache.StartCleanup(1 * time.Minute)
		logger.Info("llm_cache_enabled", "max_size", cfg.CacheMaxSize, "ttl", cfg.CacheDefaultTTL)
	}

	llmWatcher := watcher.New()
	llmWatcher.RegisterAll(func(ctx context.Context, record watcher.ErrorRecord) error {
		logger.Error("llm_provider_error",
			"category", record.Category,
			"provider", record.Provider,
			"model", record.Model,
			"message", record.Message,
			"retryable", record.Retryable,
		)
		return nil
	})

	registry := provider.NewRegistry()
	if cfg.NvidiaAPIKey != "" {
		registry.Register(provider.NewNVIDIAProviderWithOptions(cfg.NvidiaAPIKey, llmCache, llmWatcher))
	}
	if cfg.OpenAIAPIKey != "" {
		registry.Register(provider.NewOpenAIProviderWithOptions(cfg.OpenAIAPIKey, llmCache, llmWatcher))
	}
	if cfg.AnthropicAPIKey != "" {
		registry.Register(provider.NewAnthropicProviderWithOptions(cfg.AnthropicAPIKey, llmCache, llmWatcher))
	}
	if len(registry.Providers()) == 0 {
		logger.Warn("no_ai_providers_configured")
	}

	// Services
	userSvc := service.NewUserService(userRepo, cfg.AuthSecret)
	keySvc := service.NewAPIKeyService(keyRepo)
	creditSvc := service.NewCreditService(database, creditsRepo, txRepo, logRepo)
	analyticsSvc := service.NewAnalyticsService(logRepo, userRepo, creditsRepo, keyRepo)
	logSvc := service.NewLogService(logRepo)
	providerSvc := service.NewProviderServiceWithFeatures(registry, llmCache, llmWatcher)

	// Handler
	h := handler.New(cfg, database, userSvc, keySvc, creditSvc, analyticsSvc, logSvc, providerSvc)

	// Router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Timeout(cfg.RequestTimeout))
	r.Use(appmiddleware.RequestContext)
	r.Use(appmiddleware.BodyLimit(1 << 20)) // 1 MB
	r.Use(appmiddleware.RequestLogger)
	r.Use(appmiddleware.Metrics)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Api-Key"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate limiter
	rl := appmiddleware.NewRateLimiter(cfg.RateLimitWindow, cfg.RateLimitRPM)
	r.Use(appmiddleware.RateLimit(rl))

	// Auth middleware factory
	authMW := appmiddleware.Auth(cfg,
		func(ctx context.Context, key string) (*domain.User, *domain.APIKey, error) {
			return repository.GetUserByAPIKey(ctx, database, key)
		},
		func(ctx context.Context, userID string) (*domain.User, error) {
			u, err := userSvc.GetByID(ctx, userID)
			if err != nil {
				return nil, err
			}
			return u, nil
		},
	)

	// Public routes
	r.Get("/health", h.Health)
	r.Post("/auth/signup", h.Signup)
	r.Post("/auth/login", h.Login)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMW)
		r.Get("/auth/me", h.Me)
		r.Put("/auth/profile", h.UpdateProfile)
		r.Put("/auth/password", h.ChangePassword)

		r.Get("/api/keys", h.ListKeys)
		r.Post("/api/keys", h.CreateKey)
		r.Delete("/api/keys/{id}", h.DeleteKey)
		r.Post("/api/keys/{id}/revoke", h.RevokeKey)

		r.Get("/api/credits", h.GetCredits)
		r.Post("/api/credits/purchase", h.PurchaseCredits)

		r.Get("/api/transactions", h.ListTransactions)
		r.Get("/api/logs", h.ListLogs)
		r.Get("/api/analytics", h.GetAnalytics)

		r.Get("/api/models", h.ListModels)
		r.Post("/api/chat", h.ChatProxy)
	})

	// Admin routes
	r.Group(func(r chi.Router) {
		r.Use(authMW)
		r.Get("/api/admin/users", appmiddleware.RequireAdmin(h.AdminListUsers))
		r.Delete("/api/admin/users/{id}", appmiddleware.RequireAdmin(h.AdminDeleteUser))
		r.Get("/api/admin/stats", appmiddleware.RequireAdmin(h.AdminStats))
	})

	// Metrics server
	if cfg.EnableMetrics {
		go func() {
			mux := http.NewServeMux()
			mux.Handle("/metrics", promhttp.Handler())
			addr := ":" + cfg.MetricsPort
			logger.Info("metrics server starting", "addr", addr)
			if err := http.ListenAndServe(addr, mux); err != nil {
				logger.Error("metrics server failed", "error", err.Error())
			}
		}()
	}

	// Main server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	idleConnsClosed := make(chan struct{})
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
		sig := <-sigCh
		logger.Info("shutdown signal received", "signal", sig.String())

		ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			logger.Error("server shutdown error", "error", err.Error())
		}
		close(idleConnsClosed)
	}()

	logger.Info("server listening", "addr", srv.Addr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		logger.Error("server failed", "error", err.Error())
		os.Exit(1)
	}

	<-idleConnsClosed
	logger.Info("server stopped gracefully")
}
