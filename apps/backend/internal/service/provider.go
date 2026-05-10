package service

import (
	"context"
	"fmt"
	"strings"

	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/provider"
)

type ProviderService struct {
	registry *provider.Registry
}

func NewProviderService(registry *provider.Registry) *ProviderService {
	return &ProviderService{registry: registry}
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
		if _, ok := err.(*provider.ErrProviderUnavailable); ok {
			return nil, domain.NewError(domain.ErrServiceUnavailable, 503, fmt.Sprintf("%s provider unavailable", provName))
		}
		return nil, domain.Wrap(domain.ErrInternal, 500, "chat stream failed", err)
	}

	return ch, nil
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
