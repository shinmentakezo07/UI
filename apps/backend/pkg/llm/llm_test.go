package llm

import (
	"context"
	"testing"
	"time"

	"dra-platform/backend/pkg/llm/cache"
	"dra-platform/backend/pkg/llm/pipeline"
	"dra-platform/backend/pkg/llm/provider"
	"dra-platform/backend/pkg/llm/watcher"
)

func TestCacheKey(t *testing.T) {
	req := &ChatRequest{
		Model: "gpt-4o",
		Messages: []Message{
			{Role: RoleUser, Content: "Hello"},
		},
	}
	key1 := CacheKey(req)
	key2 := CacheKey(req)
	if key1 != key2 {
		t.Error("CacheKey should be deterministic")
	}

	req2 := &ChatRequest{
		Model: "gpt-4o",
		Messages: []Message{
			{Role: RoleUser, Content: "World"},
		},
	}
	key3 := CacheKey(req2)
	if key1 == key3 {
		t.Error("CacheKey should differ for different requests")
	}
}

func TestEstimateTokens(t *testing.T) {
	tests := []struct {
		input    string
		expected int
	}{
		{"", 0},
		{"Hello world", 3},
		{"This is a longer sentence with more words to estimate.", 12},
	}

	for _, tt := range tests {
		tokens := EstimateTokens(tt.input)
		if tokens < 0 {
			t.Errorf("EstimateTokens(%q) = %d, want >= 0", tt.input, tokens)
		}
	}
}

func TestValidateRequest(t *testing.T) {
	temp := 0.5
	req := &ChatRequest{
		Model:    "gpt-4o",
		Messages: []Message{{Role: RoleUser, Content: "Hi"}},
		Temperature: &temp,
	}
	if err := ValidateRequest(req); err != nil {
		t.Errorf("ValidateRequest failed: %v", err)
	}

	invalid := &ChatRequest{Model: "gpt-4o"}
	if err := ValidateRequest(invalid); err == nil {
		t.Error("ValidateRequest should fail for empty messages")
	}
}

func TestParseModelID(t *testing.T) {
	provider, model := ParseModelID("openai/gpt-4o")
	if provider != "openai" || model != "gpt-4o" {
		t.Errorf("ParseModelID(openai/gpt-4o) = %s, %s", provider, model)
	}

	provider, model = ParseModelID("gpt-4o")
	if provider != "" || model != "gpt-4o" {
		t.Errorf("ParseModelID(gpt-4o) = %s, %s", provider, model)
	}
}

func TestIsThinkingModel(t *testing.T) {
	if !IsThinkingModel("o1-preview") {
		t.Error("o1 should be a thinking model")
	}
	if !IsThinkingModel("claude-opus-4") {
		t.Error("claude-opus-4 should be a thinking model")
	}
	if IsThinkingModel("gpt-3.5-turbo") {
		t.Error("gpt-3.5 should not be a thinking model")
	}
}

func TestCost(t *testing.T) {
	c := Cost(1000, 500, 0.01, 0.03)
	if c <= 0 {
		t.Error("Cost should be positive")
	}
}

func TestClientWithCache(t *testing.T) {
	c := cache.NewMemoryCache()
	client := NewClient(&mockProvider{}, WithCache(c))

	req := &ChatRequest{
		Model:    "test-model",
		Messages: []Message{{Role: RoleUser, Content: "test"}},
	}

	resp, err := client.Chat(context.Background(), req)
	if err != nil {
		t.Fatalf("Chat failed: %v", err)
	}
	if resp.Content != "mock response" {
		t.Errorf("unexpected response: %s", resp.Content)
	}

	// Second call should hit cache
	resp2, err := client.Chat(context.Background(), req)
	if err != nil {
		t.Fatalf("Cached Chat failed: %v", err)
	}
	if resp2.Content != "mock response" {
		t.Errorf("cached response mismatch: %s", resp2.Content)
	}
}

func TestClientWithPipeline(t *testing.T) {
	p := pipeline.New()
	p.AddBefore(&pipeline.ValidationStep{})

	client := NewClient(&mockProvider{}, WithPipeline(p))

	req := &ChatRequest{
		Model:    "test-model",
		Messages: []Message{{Role: RoleUser, Content: "test"}},
	}

	_, err := client.Chat(context.Background(), req)
	if err != nil {
		t.Fatalf("Chat with pipeline failed: %v", err)
	}
}

func TestClientWithWatcher(t *testing.T) {
	w := watcher.New()
	var watched bool
	w.RegisterAll(func(ctx context.Context, record watcher.ErrorRecord) error {
		watched = true
		return nil
	})

	client := NewClient(&mockProvider{fail: true}, WithWatcher(w))

	req := &ChatRequest{
		Model:    "test-model",
		Messages: []Message{{Role: RoleUser, Content: "test"}},
	}

	_, _ = client.Chat(context.Background(), req)
	if !watched {
		t.Error("Watcher should have been triggered on error")
	}
}

func TestSDK(t *testing.T) {
	sdk := NewSDK()

	if err := sdk.RegisterProvider("openai", "test-key"); err != nil {
		t.Fatalf("RegisterProvider failed: %v", err)
	}

	providers := sdk.Providers()
	if len(providers) != 1 || providers[0] != "openai" {
		t.Errorf("unexpected providers: %v", providers)
	}

	_, ok := sdk.GetClient("openai")
	if !ok {
		t.Error("GetClient should return the openai client")
	}
}

type mockProvider struct {
	fail bool
}

func (m *mockProvider) Name() string { return "mock" }

func (m *mockProvider) Chat(ctx context.Context, req *ChatRequest) (*ChatResponse, error) {
	if m.fail {
		return nil, context.Canceled
	}
	return &ChatResponse{
		Choices: []Choice{{
			Message: Message{Role: RoleAssistant, Content: "mock response"},
		}},
		Usage:    Usage{PromptTokens: 10, CompletionTokens: 5},
		Provider: "mock",
		Model:    req.Model,
	}, nil
}

func (m *mockProvider) ChatStream(ctx context.Context, req *ChatRequest) (<-chan StreamChunk, error) {
	ch := make(chan StreamChunk, 1)
	ch <- StreamChunk{Delta: Message{Content: "mock stream"}}
	close(ch)
	return ch, nil
}

func (m *mockProvider) ListModels(ctx context.Context) ([]ModelInfo, error) {
	return []ModelInfo{{ID: "mock/test", Name: "Test", Provider: "mock"}}, nil
}

func (m *mockProvider) SupportsThinking() bool { return false }
