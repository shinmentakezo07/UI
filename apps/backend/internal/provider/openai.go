package provider

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type OpenAIProvider struct {
	apiKey  string
	client  *http.Client
	baseURL string
}

func NewOpenAIProvider(apiKey string) *OpenAIProvider {
	return &OpenAIProvider{
		apiKey:  apiKey,
		client:  &http.Client{Timeout: 120 * time.Second},
		baseURL: "https://api.openai.com/v1",
	}
}

func (p *OpenAIProvider) Name() string { return "openai" }

func (p *OpenAIProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	if p.apiKey == "" {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("API key not configured")}
	}

	body := p.buildBody(req, false)
	bodyBytes, _ := json.Marshal(body)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := HTTPDo(p.client, httpReq)
	if err != nil {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: err}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(b))}
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	content := ""
	if len(result.Choices) > 0 {
		content = result.Choices[0].Message.Content
	}

	return &ChatResponse{
		Content:      content,
		InputTokens:  result.Usage.PromptTokens,
		OutputTokens: result.Usage.CompletionTokens,
		Model:        req.Model,
		Provider:     p.Name(),
	}, nil
}

func (p *OpenAIProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	if p.apiKey == "" {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("API key not configured")}
	}

	body := p.buildBody(req, true)
	bodyBytes, _ := json.Marshal(body)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "text/event-stream")

	resp, err := HTTPDo(p.client, httpReq)
	if err != nil {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: err}
	}

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(b))}
	}

	ch := make(chan StreamChunk, 64)
	go func() {
		defer close(ch)
		defer resp.Body.Close()

		ReadSSE(resp.Body, func(line string) bool {
			if !strings.HasPrefix(line, "data: ") {
				return true
			}
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				return false
			}
			content, err := ExtractJSONContent(data)
			if err != nil {
				return true
			}
			reason := ExtractFinishReason(data)
			select {
			case ch <- StreamChunk{Content: content, FinishReason: reason}:
			case <-ctx.Done():
				return false
			}
			return true
		})
	}()

	return ch, nil
}

func (p *OpenAIProvider) ListModels(ctx context.Context) ([]ModelInfo, error) {
	return []ModelInfo{
		{ID: "openai/gpt-4o", Name: "GPT-4o", Provider: "openai", InputPricePer1k: 0.0025, OutputPricePer1k: 0.01, ContextWindow: 128000, Description: "OpenAI's most capable multimodal model.", Capabilities: []string{"text", "vision", "code"}},
		{ID: "openai/gpt-4o-mini", Name: "GPT-4o Mini", Provider: "openai", InputPricePer1k: 0.00015, OutputPricePer1k: 0.0006, ContextWindow: 128000, Description: "Fast, affordable small model for focused tasks.", Capabilities: []string{"text", "vision"}},
		{ID: "openai/gpt-4.1", Name: "GPT-4.1", Provider: "openai", InputPricePer1k: 0.002, OutputPricePer1k: 0.008, ContextWindow: 256000, Description: "Latest GPT model with improved reasoning.", Capabilities: []string{"text", "code", "reasoning"}},
		{ID: "openai/o3-mini", Name: "o3 Mini", Provider: "openai", InputPricePer1k: 0.0011, OutputPricePer1k: 0.0044, ContextWindow: 200000, Description: "Reasoning model optimized for STEM tasks.", Capabilities: []string{"text", "reasoning", "code"}},
		{ID: "openai/o1", Name: "o1", Provider: "openai", InputPricePer1k: 0.015, OutputPricePer1k: 0.06, ContextWindow: 200000, Description: "High-intelligence reasoning model.", Capabilities: []string{"text", "reasoning"}},
	}, nil
}

func (p *OpenAIProvider) buildBody(req ChatRequest, stream bool) map[string]interface{} {
	messages := make([]map[string]string, len(req.Messages))
	for i, m := range req.Messages {
		messages[i] = map[string]string{"role": m.Role, "content": m.Content}
	}
	body := map[string]interface{}{
		"model":    req.Model,
		"messages": messages,
		"stream":   stream,
	}
	if req.System != "" {
		messages = append([]map[string]string{{"role": "system", "content": req.System}}, messages...)
		body["messages"] = messages
	}
	if req.Temperature != nil {
		body["temperature"] = *req.Temperature
	}
	if req.MaxTokens != nil {
		body["max_tokens"] = *req.MaxTokens
	}
	return body
}
