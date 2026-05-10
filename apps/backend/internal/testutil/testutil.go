package testutil

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"time"

	"dra-platform/backend/internal/config"
	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/handler"
	"dra-platform/backend/internal/middleware"
	"dra-platform/backend/internal/provider"
	"dra-platform/backend/internal/repository"
	"dra-platform/backend/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

const TestAuthSecret = "test-secret-key-for-jwt-signing-only-32bytes"

// TestConfig returns a config suitable for tests.
func TestConfig() *config.Config {
	return &config.Config{
		Port:            "8080",
		DatabaseURL:     os.Getenv("TEST_DATABASE_URL"),
		AuthSecret:      TestAuthSecret,
		NvidiaAPIKey:    "test-nvidia-key",
		OpenAIAPIKey:    "test-openai-key",
		Env:             "test",
		RateLimitRPM:    1000,
		RateLimitWindow: time.Minute,
		RequestTimeout:  30 * time.Second,
		ShutdownTimeout: 5 * time.Second,
		EnableMetrics:   false,
		MetricsPort:     "9090",
	}
}

// HasTestDB returns true if TEST_DATABASE_URL is set.
func HasTestDB() bool {
	return os.Getenv("TEST_DATABASE_URL") != ""
}

// SkipIfNoDB skips the test if no test database is configured.
func SkipIfNoDB(t interface{ Skipf(string, ...any) }) {
	if !HasTestDB() {
		t.Skipf("Skipping: TEST_DATABASE_URL not set")
	}
}

// NewTestDB creates a test database connection.
func NewTestDB() (*db.DB, error) {
	if !HasTestDB() {
		return nil, fmt.Errorf("TEST_DATABASE_URL not set")
	}
	return db.New(os.Getenv("TEST_DATABASE_URL"))
}

// NewTestServer creates a fully wired test HTTP server with a test database.
func NewTestServer() (*httptest.Server, *db.DB, error) {
	database, err := NewTestDB()
	if err != nil {
		return nil, nil, err
	}

	cfg := TestConfig()

	userRepo := repository.NewUserRepo(database)
	keyRepo := repository.NewAPIKeyRepo(database)
	creditsRepo := repository.NewCreditsRepo(database)
	txRepo := repository.NewTransactionRepo(database)
	logRepo := repository.NewLogRepo(database)

	registry := provider.NewRegistry()
	registry.Register(provider.NewNVIDIAProvider(cfg.NvidiaAPIKey))
	registry.Register(provider.NewOpenAIProvider(cfg.OpenAIAPIKey))

	userSvc := service.NewUserService(userRepo, cfg.AuthSecret)
	keySvc := service.NewAPIKeyService(keyRepo)
	creditSvc := service.NewCreditService(database, creditsRepo, txRepo, logRepo)
	analyticsSvc := service.NewAnalyticsService(logRepo, userRepo, creditsRepo, keyRepo)
	logSvc := service.NewLogService(logRepo)
	providerSvc := service.NewProviderService(registry)

	h := handler.New(cfg, database, userSvc, keySvc, creditSvc, analyticsSvc, logSvc, providerSvc)

	authMW := middleware.Auth(cfg,
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

	r := chi.NewRouter()
	r.Get("/health", h.Health)
	r.Post("/auth/signup", h.Signup)
	r.Post("/auth/login", h.Login)

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

	r.Group(func(r chi.Router) {
		r.Use(authMW)
		r.Get("/api/admin/users", middleware.RequireAdmin(h.AdminListUsers))
		r.Delete("/api/admin/users/{id}", middleware.RequireAdmin(h.AdminDeleteUser))
		r.Get("/api/admin/stats", middleware.RequireAdmin(h.AdminStats))
	})

	return httptest.NewServer(r), database, nil
}

// GenerateTestJWT creates a valid JWT for a test user.
func GenerateTestJWT(userID, email, name string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"name":  name,
		"exp":   time.Now().Add(time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	})
	s, _ := token.SignedString([]byte(TestAuthSecret))
	return s
}

// BearerHeader returns an Authorization header with a test JWT.
func BearerHeader(userID, email, name string) http.Header {
	h := http.Header{}
	h.Set("Authorization", "Bearer "+GenerateTestJWT(userID, email, name))
	return h
}

// CleanTables truncates all tables for a fresh test state.
func CleanTables(d *db.DB) error {
	ctx := context.Background()
	_, err := d.Pool.Exec(ctx, `
		TRUNCATE TABLE users, api_keys, user_credits, credit_transactions, api_logs RESTART IDENTITY CASCADE
	`)
	return err
}

// SeedUser creates a test user directly in the DB.
func SeedUser(d *db.DB, name, email, password string) (*domain.User, error) {
	ctx := context.Background()
	hash, err := service.HashPassword(password)
	if err != nil {
		return nil, err
	}
	repo := repository.NewUserRepo(d)
	return repo.Create(ctx, name, email, hash, "user")
}

// SeedAdmin creates a test admin directly in the DB.
func SeedAdmin(d *db.DB, name, email, password string) (*domain.User, error) {
	ctx := context.Background()
	hash, err := service.HashPassword(password)
	if err != nil {
		return nil, err
	}
	repo := repository.NewUserRepo(d)
	return repo.Create(ctx, name, email, hash, "admin")
}

// SeedCredits creates initial credits for a user.
func SeedCredits(d *db.DB, userID string, amount int) error {
	ctx := context.Background()
	repo := repository.NewCreditsRepo(d)
	return repo.Upsert(ctx, userID, amount, amount)
}

// MustReadBody reads the full response body and closes it.
func MustReadBody(resp *http.Response) string {
	defer resp.Body.Close()
	var b strings.Builder
	if _, err := b.ReadFrom(resp.Body); err != nil {
		return ""
	}
	return b.String()
}
