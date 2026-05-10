package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"dra-platform/backend/pkg/llm"
	llmcache "dra-platform/backend/pkg/llm/cache"
	llmprovider "dra-platform/backend/pkg/llm/provider"
	llmwatcher "dra-platform/backend/pkg/llm/watcher"
)

// Message represents a chat message.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest is the unified request shape.
type ChatRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature *float64  `json:"temperature,omitempty"`
	MaxTokens   *int      `json:"max_tokens,omitempty"`
	Stream      bool      `json:"stream"`
	System      string    `json:"system,omitempty"`
}

// ChatResponse is a non-streaming response.
type ChatResponse struct {
	Content      string `json:"content"`
	InputTokens  int    `json:"input_tokens"`
	OutputTokens int    `json:"output_tokens"`
	Model        string `json:"model"`
	Provider     string `json:"provider"`
}

// StreamChunk is a single chunk from a streaming response.
type StreamChunk struct {
	Content      string `json:"content"`
	FinishReason string `json:"finish_reason,omitempty"`
}

// ModelInfo describes an available model.
type ModelInfo struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Provider         string   `json:"provider"`
	InputPricePer1k  float64  `json:"input_price_per_1k"`
	OutputPricePer1k float64  `json:"output_price_per_1k"`
	ContextWindow    int      `json:"context_window"`
	Description      string   `json:"description"`
	Capabilities     []string `json:"capabilities"`
}

// Provider is the interface for AI backends.
type Provider interface {
	Name() string
	Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
	ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error)
	ListModels(ctx context.Context) ([]ModelInfo, error)
}

// Registry holds configured providers.
type Registry struct {
	providers map[string]Provider
	models    []ModelInfo
}

func NewRegistry() *Registry {
	return &Registry{providers: make(map[string]Provider)}
}

func (r *Registry) Register(p Provider) {
	r.providers[p.Name()] = p
}

func (r *Registry) Get(providerName string) (Provider, bool) {
	p, ok := r.providers[providerName]
	return p, ok
}

func (r *Registry) Providers() []string {
	names := make([]string, 0, len(r.providers))
	for n := range r.providers {
		names = append(names, n)
	}
	return names
}

func (r *Registry) AllModels(ctx context.Context) ([]ModelInfo, error) {
	if r.models != nil {
		return r.models, nil
	}
	var all []ModelInfo
	for _, p := range r.providers {
		models, err := p.ListModels(ctx)
		if err != nil {
			continue // skip failing providers
		}
		all = append(all, models...)
	}
	r.models = all
	return all, nil
}

func (r *Registry) InvalidateCache() {
	r.models = nil
}

// ParseModelID splits "provider/model-id" into provider and model.
func ParseModelID(id string) (provider, model string) {
	parts := strings.SplitN(id, "/", 2)
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return "", id
}

// HTTPDo performs an HTTP request with timeout and standard headers.
func HTTPDo(client *http.Client, req *http.Request) (*http.Response, error) {
	if client == nil {
		client = &http.Client{Timeout: 120 * time.Second}
	}
	return client.Do(req)
}

// ReadSSE reads server-sent events from a reader and yields data lines.
func ReadSSE(r io.Reader, yield func(string) bool) {
	llmprovider.ReadSSE(r, yield)
}

// CountTokens estimates token count using a simple heuristic (4 chars ≈ 1 token).
func CountTokens(text string) int {
	return llm.EstimateTokens(text)
}

// ExtractJSONContent pulls the assistant content from an OpenAI-style JSON chunk.
func ExtractJSONContent(data string) (string, error) {
	var chunk struct {
		Choices []struct {
			Delta struct {
				Content string `json:"content"`
			} `json:"delta"`
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
	}
	if err := json.Unmarshal([]byte(data), &chunk); err != nil {
		return "", err
	}
	if len(chunk.Choices) > 0 {
		return chunk.Choices[0].Delta.Content, nil
	}
	return "", nil
}

// ExtractFinishReason pulls finish_reason from an OpenAI-style JSON chunk.
func ExtractFinishReason(data string) string {
	var chunk struct {
		Choices []struct {
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
	}
	json.Unmarshal([]byte(data), &chunk)
	if len(chunk.Choices) > 0 {
		return chunk.Choices[0].FinishReason
	}
	return ""
}

// ErrProviderUnavailable is returned when a provider cannot be reached.
type ErrProviderUnavailable struct {
	Provider string
	Cause    error
}

func (e *ErrProviderUnavailable) Error() string {
	return fmt.Sprintf("provider %s unavailable: %v", e.Provider, e.Cause)
}

func (e *ErrProviderUnavailable) Unwrap() error { return e.Cause }

// --- Conversion helpers between internal and pkg/llm types ---

func toLLMMessages(msgs []Message) []llm.Message {
	result := make([]llm.Message, len(msgs))
	for i, m := range msgs {
		result[i] = llm.Message{
			Role:    llm.Role(m.Role),
			Content: m.Content,
		}
	}
	return result
}

func fromLLMResponse(resp *llm.ChatResponse) *ChatResponse {
	content := ""
	if len(resp.Choices) > 0 {
		content = resp.Choices[0].Message.Content
	}
	return &ChatResponse{
		Content:      content,
		InputTokens:  resp.Usage.PromptTokens,
		OutputTokens: resp.Usage.CompletionTokens,
		Model:        resp.Model,
		Provider:     resp.Provider,
	}
}

func fromLLMStreamChunk(ch <-chan llm.StreamChunk) <-chan StreamChunk {
	out := make(chan StreamChunk, 64)
	go func() {
		defer close(out)
		for chunk := range ch {
			var fr string
			if chunk.FinishReason != nil {
				fr = string(*chunk.FinishReason)
			}
			out <- StreamChunk{
				Content:      chunk.Delta.Content,
				FinishReason: fr,
			}
		}
	}()
	return out
}

func fromLLMModels(models []llm.ModelInfo) []ModelInfo {
	result := make([]ModelInfo, len(models))
	for i, m := range models {
		result[i] = ModelInfo{
			ID:               m.ID,
			Name:             m.Name,
			Provider:         m.Provider,
			InputPricePer1k:  m.InputPricePer1k,
			OutputPricePer1k: m.OutputPricePer1k,
			ContextWindow:    m.ContextWindow,
			Description:      m.Description,
			Capabilities:     m.Capabilities,
		}
	}
	return result
}

func toLLMChatRequest(req ChatRequest) *llm.ChatRequest {
	return &llm.ChatRequest{
		Model:       req.Model,
		Messages:    toLLMMessages(req.Messages),
		Temperature: req.Temperature,
		MaxTokens:   req.MaxTokens,
		Stream:      req.Stream,
		System:      req.System,
	}
}

// wrapError wraps an error from pkg/llm into ErrProviderUnavailable if appropriate.
func wrapError(provider string, err error) error {
	if err == nil {
		return nil
	}
	return &ErrProviderUnavailable{Provider: provider, Cause: err}
}

// --- New provider constructors that delegate to pkg/llm/provider ---

// NewOpenAIProvider creates an OpenAI provider with SDK features.
func NewOpenAIProvider(apiKey string) Provider {
	return &openAIProviderWrapper{
		inner: llmprovider.NewOpenAIProvider(llmprovider.WithAPIKey(apiKey)),
	}
}

// NewAnthropicProvider creates an Anthropic provider with SDK features.
func NewAnthropicProvider(apiKey string) Provider {
	return &anthropicProviderWrapper{
		inner: llmprovider.NewAnthropicProvider(llmprovider.WithAPIKey(apiKey)),
	}
}

// NewNVIDIAProvider creates an NVIDIA (generic OpenAI-compatible) provider.
func NewNVIDIAProvider(apiKey string) Provider {
	return &genericProviderWrapper{
		name:  "nvidia",
		inner: llmprovider.NewGenericProvider("nvidia", "https://integrate.api.nvidia.com/v1", llmprovider.WithAPIKey(apiKey)),
	}
}

// openAIProviderWrapper wraps pkg/llm/provider.OpenAIProvider.
type openAIProviderWrapper struct {
	inner *llmprovider.OpenAIProvider
}

func (p *openAIProviderWrapper) Name() string { return p.inner.Name() }

func (p *openAIProviderWrapper) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	resp, err := p.inner.Chat(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMResponse(resp), nil
}

func (p *openAIProviderWrapper) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	ch, err := p.inner.ChatStream(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMStreamChunk(ch), nil
}

func (p *openAIProviderWrapper) ListModels(ctx context.Context) ([]ModelInfo, error) {
	models, err := p.inner.ListModels(ctx)
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMModels(models), nil
}

// anthropicProviderWrapper wraps pkg/llm/provider.AnthropicProvider.
type anthropicProviderWrapper struct {
	inner *llmprovider.AnthropicProvider
}

func (p *anthropicProviderWrapper) Name() string { return p.inner.Name() }

func (p *anthropicProviderWrapper) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	resp, err := p.inner.Chat(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMResponse(resp), nil
}

func (p *anthropicProviderWrapper) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	ch, err := p.inner.ChatStream(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMStreamChunk(ch), nil
}

func (p *anthropicProviderWrapper) ListModels(ctx context.Context) ([]ModelInfo, error) {
	models, err := p.inner.ListModels(ctx)
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMModels(models), nil
}

// genericProviderWrapper wraps pkg/llm/provider.GenericProvider.
type genericProviderWrapper struct {
	name  string
	inner *llmprovider.GenericProvider
}

func (p *genericProviderWrapper) Name() string { return p.name }

func (p *genericProviderWrapper) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	resp, err := p.inner.Chat(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMResponse(resp), nil
}

func (p *genericProviderWrapper) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	ch, err := p.inner.ChatStream(ctx, toLLMChatRequest(req))
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMStreamChunk(ch), nil
}

func (p *genericProviderWrapper) ListModels(ctx context.Context) ([]ModelInfo, error) {
	models, err := p.inner.ListModels(ctx)
	if err != nil {
		return nil, wrapError(p.Name(), err)
	}
	return fromLLMModels(models), nil
}

// --- Advanced provider creation with SDK features ---

// NewOpenAIProviderWithOptions creates an OpenAI provider with advanced options.
func NewOpenAIProviderWithOptions(apiKey string, cache llmcache.Cache, watch *llmwatcher.Watcher) Provider {
	opts := []llmprovider.Option{llmprovider.WithAPIKey(apiKey)}
	if cache != nil {
		opts = append(opts, llmprovider.WithCache(cache))
	}
	if watch != nil {
		opts = append(opts, llmprovider.WithWatcher(watch))
	}
	return &openAIProviderWrapper{inner: llmprovider.NewOpenAIProvider(opts...)}
}

// NewAnthropicProviderWithOptions creates an Anthropic provider with advanced options.
func NewAnthropicProviderWithOptions(apiKey string, cache llmcache.Cache, watch *llmwatcher.Watcher) Provider {
	opts := []llmprovider.Option{llmprovider.WithAPIKey(apiKey)}
	if cache != nil {
		opts = append(opts, llmprovider.WithCache(cache))
	}
	if watch != nil {
		opts = append(opts, llmprovider.WithWatcher(watch))
	}
	return &anthropicProviderWrapper{inner: llmprovider.NewAnthropicProvider(opts...)}
}
