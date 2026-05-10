package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"dra-platform/backend/internal/config"
	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/middleware"
	"dra-platform/backend/internal/pkg/logger"
	"dra-platform/backend/internal/pkg/response"
	"dra-platform/backend/internal/provider"
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
	providerSvc  *service.ProviderService
}

func New(cfg *config.Config, database *db.DB, u *service.UserService, k *service.APIKeyService, c *service.CreditService, a *service.AnalyticsService, l *service.LogService, p *service.ProviderService) *Handler {
	return &Handler{cfg: cfg, db: database, userSvc: u, keySvc: k, creditSvc: c, analyticsSvc: a, logSvc: l, providerSvc: p}
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
	auth, appErr := h.userSvc.Authenticate(r.Context(), req)
	if appErr != nil {
		response.JSON(w, appErr.Status, response.Body{Success: false, Error: appErr.Message})
		return
	}
	response.OK(w, auth)
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

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	if req.Name == "" || len(req.Name) < 2 {
		response.Error(w, 400, "Name must be at least 2 characters")
		return
	}
	if req.Email == "" {
		response.Error(w, 400, "Email is required")
		return
	}
	if err := h.userSvc.UpdateProfile(r.Context(), u.ID, req.Name, req.Email); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, map[string]bool{"updated": true})
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	u := middleware.GetUser(r)
	if u == nil {
		response.Error(w, 401, "Authentication required")
		return
	}
	var req struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	if req.CurrentPassword == "" || req.NewPassword == "" {
		response.Error(w, 400, "Current and new passwords are required")
		return
	}
	if len(req.NewPassword) < 6 {
		response.Error(w, 400, "New password must be at least 6 characters")
		return
	}
	if err := h.userSvc.ChangePassword(r.Context(), u.ID, req.CurrentPassword, req.NewPassword); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, map[string]bool{"updated": true})
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

func (h *Handler) RevokeKey(w http.ResponseWriter, r *http.Request) {
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
	if err := h.keySvc.Revoke(r.Context(), u.ID, id); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}
	response.OK(w, map[string]bool{"revoked": true})
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
	models, err := h.providerSvc.ListModels(r.Context())
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
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

	var req domain.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}
	if vErr := req.Validate(); vErr != nil {
		response.JSON(w, vErr.Status, response.Body{Success: false, Error: vErr.Message})
		return
	}

	if req.Model == "" {
		req.Model = h.providerSvc.DefaultModel()
	}

	// Estimate cost for pre-check
	estInput, estOutput := h.providerSvc.EstimateTokens(req.Model, req.Messages)
	estimatedCost := (estInput + estOutput) * 2 // rough cost multiplier
	if estimatedCost < 100 {
		estimatedCost = 100
	}

	if err := h.creditSvc.CheckBalance(r.Context(), u.ID, estimatedCost); err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}

	// Handle non-streaming
	stream := false
	if r.URL.Query().Get("stream") == "true" {
		stream = true
	}
	if req.Messages != nil && len(req.Messages) > 0 {
		// peek at body if stream flag was in json; already decoded
		// We rely on query param for now. Frontend can set ?stream=true
	}

	// Always stream for now to match existing behavior
	ch, err := h.providerSvc.ChatStream(r.Context(), req)
	if err != nil {
		response.JSON(w, err.Status, response.Body{Success: false, Error: err.Message})
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	var outputTokens int
	var outputBuf strings.Builder
	flusher, ok := w.(http.Flusher)

	done := r.Context().Done()
	for {
		select {
		case chunk, more := <-ch:
			if !more {
				goto FINISH
			}
			if chunk.Content != "" {
				outputBuf.WriteString(chunk.Content)
				outputTokens += provider.CountTokens(chunk.Content)
				data, _ := json.Marshal(map[string]interface{}{
					"choices": []map[string]interface{}{{
						"delta": map[string]string{"content": chunk.Content},
					}},
				})
				fmt.Fprintf(w, "data: %s\n\n", string(data))
				if ok {
					flusher.Flush()
				}
			}
			if chunk.FinishReason != "" {
				fmt.Fprintf(w, "data: [DONE]\n\n")
				if ok {
					flusher.Flush()
				}
				goto FINISH
			}
		case <-done:
			goto FINISH
		}
	}

FINISH:
	inputTokens := provider.CountTokens(outputBuf.String()) // rough estimate for input
	if inputTokens == 0 {
		inputTokens = len(req.Messages) * 50
	}
	if outputTokens == 0 {
		outputTokens = inputTokens / 2
	}
	cost := (inputTokens + outputTokens) * 2
	if cost < 100 {
		cost = 100
	}
	latency := 0

	// Async logging
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
		_, logErr := h.creditSvc.LogAndDeduct(context.Background(), userID, akID, model, inputTokens, outputTokens, cost, latency)
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
