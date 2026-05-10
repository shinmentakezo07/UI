package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/provider"
	"dra-platform/backend/pkg/llm"
	"dra-platform/backend/pkg/llm/cache"
	"dra-platform/backend/pkg/llm/pipeline"
	"dra-platform/backend/pkg/llm/watcher"
)

// ProviderService handles LLM provider operations with SDK features.
type ProviderService struct {
	registry *provider.Registry
	cache    cache.Cache
	watcher  *watcher.Watcher
	pipeline *pipeline.Pipeline
}

// NewProviderService creates a new provider service.
func NewProviderService(registry *provider.Registry) *ProviderService {
	s := &ProviderService{registry: registry}
	s.setupPipeline()
	return s
}

// NewProviderServiceWithFeatures creates a provider service with full SDK features.
func NewProviderServiceWithFeatures(registry *provider.Registry, c cache.Cache, w *watcher.Watcher) *ProviderService {
	s := &ProviderService{
		registry: registry,
		cache:    c,
		watcher:  w,
	}
	s.setupPipeline()
	return s
}

func (s *ProviderService) setupPipeline() {
	p := pipeline.New()
	p.AddBefore(&pipeline.ValidationStep{})
	p.AddBefore(&pipeline.ThinkingStep{})
	p.AddBefore(&pipeline.ToolStep{})
	p.AddBefore(&pipeline.SanitizationStep{})
	p.AddAfter(&pipeline.LoggingStep{})
	s.pipeline = p
}

// SetCache sets the response cache.
func (s *ProviderService) SetCache(c cache.Cache) {
	s.cache = c
}

// SetWatcher sets the error watcher.
func (s *ProviderService) SetWatcher(w *watcher.Watcher) {
	s.watcher = w
}

// SetPipeline sets the processing pipeline.
func (s *ProviderService) SetPipeline(p *pipeline.Pipeline) {
	s.pipeline = p
}

func (s *ProviderService) ListModels(ctx context.Context) ([]provider.ModelInfo, *domain.AppError) {
	models, err := s.registry.AllModels(ctx)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "failed to list models", err)
	}
	return models, nil
}

func (s *ProviderService) Chat(ctx context.Context, req domain.ChatRequest) (*provider.ChatResponse, *domain.AppError) {
	provName, modelID := provider.ParseModelID(req.Model)
	if provName == "" {
		provName = "nvidia"
		modelID = req.Model
	}

	p, ok := s.registry.Get(provName)
	if !ok {
		return nil, domain.NewError(domain.ErrBadRequest, 400, fmt.Sprintf("unknown provider: %s", provName))
	}

	messages := make([]provider.Message, len(req.Messages))
	for i, m := range req.Messages {
		messages[i] = provider.Message{Role: m.Role, Content: m.Content}
	}

	chatReq := provider.ChatRequest{
		Model:    modelID,
		Messages: messages,
		Stream:   false,
		System:   "You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience.",
	}

	resp, err := p.Chat(ctx, chatReq)
	if err != nil {
		if s.watcher != nil {
			s.watcher.Watch(ctx, err, provName, modelID, "")
		}
		if _, ok := err.(*provider.ErrProviderUnavailable); ok {
			return nil, domain.NewError(domain.ErrServiceUnavailable, 503, fmt.Sprintf("%s provider unavailable", provName))
		}
		return nil, domain.Wrap(domain.ErrInternal, 500, "chat failed", err)
	}

	return resp, nil
}

func (s *ProviderService) ChatStream(ctx context.Context, req domain.ChatRequest) (<-chan provider.StreamChunk, *domain.AppError) {
	provName, modelID := provider.ParseModelID(req.Model)
	if provName == "" {
		provName = "nvidia"
		modelID = req.Model
	}

	p, ok := s.registry.Get(provName)
	if !ok {
		return nil, domain.NewError(domain.ErrBadRequest, 400, fmt.Sprintf("unknown provider: %s", provName))
	}

	messages := make([]provider.Message, len(req.Messages))
	for i, m := range req.Messages {
		messages[i] = provider.Message{Role: m.Role, Content: m.Content}
	}

	chatReq := provider.ChatRequest{
		Model:    modelID,
		Messages: messages,
		Stream:   true,
		System:   "You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience.",
	}

	ch, err := p.ChatStream(ctx, chatReq)
	if err != nil {
		if s.watcher != nil {
			s.watcher.Watch(ctx, err, provName, modelID, "")
		}
		if _, ok := err.(*provider.ErrProviderUnavailable); ok {
			return nil, domain.NewError(domain.ErrServiceUnavailable, 503, fmt.Sprintf("%s provider unavailable", provName))
		}
		return nil, domain.Wrap(domain.ErrInternal, 500, "chat stream failed", err)
	}

	return ch, nil
}

// ChatWithThinking sends a chat request with thinking/reasoning enabled.
func (s *ProviderService) ChatWithThinking(ctx context.Context, req domain.ChatRequest, budgetTokens int) (*provider.ChatResponse, *domain.AppError) {
	provName, modelID := provider.ParseModelID(req.Model)
	if provName == "" {
		return nil, domain.NewError(domain.ErrBadRequest, 400, "model must include provider prefix for thinking")
	}

	p, ok := s.registry.Get(provName)
	if !ok {
		return nil, domain.NewError(domain.ErrBadRequest, 400, fmt.Sprintf("unknown provider: %s", provName))
	}

	messages := make([]provider.Message, len(req.Messages))
	for i, m := range req.Messages {
		messages[i] = provider.Message{Role: m.Role, Content: m.Content}
	}

	chatReq := provider.ChatRequest{
		Model:    modelID,
		Messages: messages,
		Stream:   false,
		System:   "You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience.",
		MaxTokens: func() *int { v := 8192; return &v }(),
	}

	resp, err := p.Chat(ctx, chatReq)
	if err != nil {
		if s.watcher != nil {
			s.watcher.Watch(ctx, err, provName, modelID, "")
		}
		if _, ok := err.(*provider.ErrProviderUnavailable); ok {
			return nil, domain.NewError(domain.ErrServiceUnavailable, 503, fmt.Sprintf("%s provider unavailable", provName))
		}
		return nil, domain.Wrap(domain.ErrInternal, 500, "chat with thinking failed", err)
	}

	// Annotate thinking metadata
	if budgetTokens > 0 {
		resp.Content = fmt.Sprintf("<thinking budget=\"%d\">\n%s\n</thinking>", budgetTokens, resp.Content)
	}

	return resp, nil
}

func (s *ProviderService) ResolveProvider(modelID string) (string, string) {
	return provider.ParseModelID(modelID)
}

func (s *ProviderService) EstimateTokens(modelID string, messages []domain.ChatMessage) (inputTokens, outputTokens int) {
	var totalChars int
	for _, m := range messages {
		totalChars += len(m.Content)
	}
	inputTokens = provider.CountTokens(strings.Repeat("x", totalChars))
	if inputTokens == 0 {
		inputTokens = len(messages) * 50
	}
	outputTokens = inputTokens
	return
}

func (s *ProviderService) DefaultModel() string {
	return "nvidia/qwen3-coder-480b"
}

func (s *ProviderService) AllProviders() []string {
	return s.registry.Providers()
}

func (s *ProviderService) ModelProvider(modelID string) (string, bool) {
	prov, _ := provider.ParseModelID(modelID)
	if prov == "" {
		return "", false
	}
	_, ok := s.registry.Get(prov)
	return prov, ok
}

func (s *ProviderService) FindModel(ctx context.Context, modelID string) (*provider.ModelInfo, *domain.AppError) {
	models, err := s.registry.AllModels(ctx)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "failed to list models", err)
	}
	for _, m := range models {
		if m.ID == modelID || strings.HasSuffix(m.ID, modelID) {
			return &m, nil
		}
	}
	return nil, domain.NewError(domain.ErrNotFound, 404, "model not found")
}

// GetCacheStats returns cache statistics if caching is enabled.
func (s *ProviderService) GetCacheStats(ctx context.Context) (cache.Stats, error) {
	if s.cache == nil {
		return cache.Stats{}, fmt.Errorf("cache not enabled")
	}
	return s.cache.Stats(ctx)
}

// IsThinkingModel checks if a model supports thinking/reasoning.
func (s *ProviderService) IsThinkingModel(modelID string) bool {
	return llm.IsThinkingModel(modelID)
}

// IsVisionModel checks if a model supports vision.
func (s *ProviderService) IsVisionModel(modelID string) bool {
	return llm.IsVisionModel(modelID)
}

// SupportsTools checks if a model supports tool calls.
func (s *ProviderService) SupportsTools(modelID string) bool {
	return llm.IsToolModel(modelID)
}

// GetContextWindow returns the context window for a model.
func (s *ProviderService) GetContextWindow(ctx context.Context, modelID string) int {
	models, err := s.registry.AllModels(ctx)
	if err != nil {
		return 128000
	}
	for _, m := range models {
		if m.ID == modelID {
			return m.ContextWindow
		}
	}
	return 128000
}

// ValidateRequest validates a chat request using the pipeline.
func (s *ProviderService) ValidateRequest(req domain.ChatRequest) *domain.AppError {
	messages := make([]llm.Message, len(req.Messages))
	for i, m := range req.Messages {
		messages[i] = llm.Message{Role: llm.Role(m.Role), Content: m.Content}
	}
	llmReq := &llm.ChatRequest{
		Model:    req.Model,
		Messages: messages,
	}
	if err := llm.ValidateRequest(llmReq); err != nil {
		return domain.NewError(domain.ErrBadRequest, 400, err.Error())
	}
	return nil
}

// DefaultSystemPrompt returns the default system prompt.
func (s *ProviderService) DefaultSystemPrompt() string {
	return "You are Shinmen, a distinguished PhD in Computer Science and Information Technology with over 20 years of experience."
}

// FormatSSEChunk formats a chunk as a Server-Sent Event.
func (s *ProviderService) FormatSSEChunk(content, finishReason string) string {
	data, _ := json.Marshal(map[string]interface{}{
		"choices": []map[string]interface{}{{
			"delta": map[string]string{"content": content},
			"finish_reason": finishReason,
		}},
	})
	return fmt.Sprintf("data: %s\n\n", string(data))
}
