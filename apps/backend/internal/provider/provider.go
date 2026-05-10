package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
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
	buf := make([]byte, 4096)
	var line []byte
	for {
		n, err := r.Read(buf)
		if n > 0 {
			for i := 0; i < n; i++ {
				b := buf[i]
				if b == '\n' {
					if len(line) > 0 {
						if !yield(string(line)) {
							return
						}
					}
					line = line[:0]
				} else if b != '\r' {
					line = append(line, b)
				}
			}
		}
		if err != nil {
			if len(line) > 0 {
				yield(string(line))
			}
			return
		}
	}
}

// CountTokens estimates token count using a simple heuristic (4 chars ≈ 1 token).
func CountTokens(text string) int {
	return len(text) / 4
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
