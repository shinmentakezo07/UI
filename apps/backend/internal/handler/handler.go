package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"

	"dra-platform/backend/internal/config"
	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/middleware"
	"dra-platform/backend/internal/pkg/logger"
	"dra-platform/backend/internal/pkg/response"
	"dra-platform/backend/internal/service"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	cfg          *config.Config
	db           *db.DB
	userSvc      *service.UserService
	keySvc       *service.APIKeyService
	creditSvc    *service.CreditService
	analyticsSvc *service.AnalyticsService
	logSvc       *service.LogService
}

func New(cfg *config.Config, database *db.DB, u *service.UserService, k *service.APIKeyService, c *service.CreditService, a *service.AnalyticsService, l *service.LogService) *Handler {
	return &Handler{cfg: cfg, db: database, userSvc: u, keySvc: k, creditSvc: c, analyticsSvc: a, logSvc: l}
}

func parsePagination(r *http.Request) (page, limit int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 { page = 1 }
	limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 { limit = 20 }
	return page, limit
}

// Health
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	if err := h.db.Health(r.Context()); err != nil {
		logger.Error("health_check_failed", "error", err.Error())
		response.JSON(w, http.StatusServiceUnavailable, response.Body{Success: false, Error: "Database unavailable"})
		return
	}
	response.OK(w, map[string]string{"status": "ok", "version": "1.0.0"})
}

// Auth
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var req domain.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	user, appErr := h.userSvc.Register(r.Context(), req)
	if appErr != nil {
		response.JSON(w, appErr.Status, response.Body{Success: false, Error: appErr.Message})
		return
	}
	response.Created(w, user)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	user, appErr := h.userSvc.Authenticate(r.Context(), req)
	if appErr != nil {
		response.JSON(w, appErr.Status, response.Body{Success: false, Error: appErr.Message})
		return
	}
	response.OK(w, user)
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Not authenticated")
		return
	}
	user, err := h.userSvc.GetByID(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, user)
}

// API Keys
func (h *Handler) ListKeys(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	keys, err := h.keySvc.List(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, keys)
}

func (h *Handler) CreateKey(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	var req domain.CreateKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	key, err := h.keySvc.Create(r.Context(), u.ID, req)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.Created(w, key)
}

func (h *Handler) DeleteKey(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	id := chi.URLParam(r, "id")
	if id == "" { id = r.URL.Query().Get("id") }
	if id == "" {
		response.Error(w, 400, "ID required")
		return
	}
	if err := h.keySvc.Delete(r.Context(), u.ID, id); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, map[string]bool{"deleted": true})
}

// Credits
func (h *Handler) GetCredits(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	credits, err := h.creditSvc.GetBalance(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, credits)
}

func (h *Handler) PurchaseCredits(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	var req domain.PurchaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	tx, err := h.creditSvc.Purchase(r.Context(), u.ID, req)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.Created(w, tx)
}

// Transactions
func (h *Handler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	page, limit := parsePagination(r)
	txs, total, err := h.creditSvc.ListTransactions(r.Context(), u.ID, page, limit)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.Paginated(w, txs, total, page, limit)
}

// Logs
func (h *Handler) ListLogs(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	page, limit := parsePagination(r)
	logs, total, err := h.logSvc.ListLogs(r.Context(), u.ID, page, limit)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.Paginated(w, logs, total, page, limit)
}

// Analytics
func (h *Handler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	data, err := h.analyticsSvc.UserAnalytics(r.Context(), u.ID)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, data)
}

// Models
func (h *Handler) ListModels(w http.ResponseWriter, r *http.Request) {
	models := []domain.ModelInfo{
		{ID: "openai/gpt-5.4", Name: "GPT-5.4", Provider: "OpenAI", InputPricePer1k: 0.015, OutputPricePer1k: 0.045, ContextWindow: "256K", Description: "OpenAI's most capable model for complex reasoning and coding.", Capabilities: []string{"text", "code", "reasoning"}},
		{ID: "anthropic/claude-opus-4.6-fast", Name: "Claude Opus 4.6 Fast", Provider: "Anthropic", InputPricePer1k: 0.008, OutputPricePer1k: 0.024, ContextWindow: "200K", Description: "Anthropic's flagship model with exceptional reasoning.", Capabilities: []string{"text", "code", "analysis"}},
		{ID: "google/gemini-3-flash-preview", Name: "Gemini 3 Flash Preview", Provider: "Google", InputPricePer1k: 0.0002, OutputPricePer1k: 0.0008, ContextWindow: "2M", Description: "Google's fast and cost-effective multimodal model.", Capabilities: []string{"text", "vision", "multimodal"}},
		{ID: "moonshotai/kimi-k2.5", Name: "Kimi K2.5", Provider: "Moonshot AI", InputPricePer1k: 0.0003, OutputPricePer1k: 0.0009, ContextWindow: "256K", Description: "Long-context model excellent for document analysis.", Capabilities: []string{"text", "long-context"}},
		{ID: "nvidia/qwen3-coder-480b", Name: "Qwen3 Coder 480B", Provider: "NVIDIA", InputPricePer1k: 0.001, OutputPricePer1k: 0.003, ContextWindow: "128K", Description: "Specialized coding model with strong code generation.", Capabilities: []string{"text", "code"}},
	}
	response.OK(w, models)
}

// Chat Proxy
func (h *Handler) ChatProxy(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}

	if err := h.creditSvc.CheckBalance(r.Context(), u.ID, 1500); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}

	var req domain.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	if vErr := req.Validate(); vErr != nil {
		response.JSON(w, vErr.Status, response.Body{Success: false, Error: vErr.Message})
		return
	}

	apiKey := h.cfg.AIAPIKey()
	if apiKey == "" {
		response.Error(w, 503, "AI API key not configured")
		return
	}

	body := map[string]interface{}{
		"model":    req.Model,
		"messages": req.Messages,
		"stream":   true,
		"system":   "You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience.",
	}
	bodyBytes, _ := json.Marshal(body)

	proxyReq, err := http.NewRequestWithContext(r.Context(), "POST", "https://integrate.api.nvidia.com/v1/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		response.Error(w, 502, err.Error())
		return
	}
	proxyReq.Header.Set("Authorization", "Bearer "+apiKey)
	proxyReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(proxyReq)
	if err != nil {
		response.Error(w, 502, err.Error())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		response.Error(w, resp.StatusCode, string(b))
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	io.Copy(w, resp.Body)

	// Async logging — capture values before spawning goroutine
	apiKeyID := ""
	if k := middleware.GetAPIKey(r); k != nil {
		apiKeyID = k.ID
	}
	var akID *string
	if apiKeyID != "" {
		akID = &apiKeyID
	}
	userID := u.ID
	model := req.Model

	go func() {
		_, logErr := h.creditSvc.LogAndDeduct(context.Background(), userID, akID, model, 1000, 500, 1500, 0)
		if logErr != nil {
			logger.Error("post_chat_billing_failed", "error", logErr.Error(), "user_id", userID)
		}
	}()
}

// Admin
func (h *Handler) AdminListUsers(w http.ResponseWriter, r *http.Request) {
	page, limit := parsePagination(r)
	users, total, err := h.userSvc.List(r.Context(), page, limit)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.Paginated(w, users, total, page, limit)
}

func (h *Handler) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" { id = r.URL.Query().Get("id") }
	if id == "" {
		response.Error(w, 400, "ID required")
		return
	}
	if err := h.userSvc.Delete(r.Context(), id); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, map[string]bool{"deleted": true})
}

func (h *Handler) AdminStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.analyticsSvc.PlatformStats(r.Context())
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, stats)
}
