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

type AnthropicProvider struct {
	apiKey  string
	client  *http.Client
	baseURL string
}

func NewAnthropicProvider(apiKey string) *AnthropicProvider {
	return &AnthropicProvider{
		apiKey:  apiKey,
		client:  &http.Client{Timeout: 120 * time.Second},
		baseURL: "https://api.anthropic.com/v1",
	}
}

func (p *AnthropicProvider) Name() string { return "anthropic" }

func (p *AnthropicProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	if p.apiKey == "" {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("API key not configured")}
	}

	body := p.buildBody(req, false)
	bodyBytes, _ := json.Marshal(body)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/messages", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("x-api-key", p.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")
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
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
		Usage struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	content := ""
	for _, c := range result.Content {
		if c.Type == "text" {
			content += c.Text
		}
	}

	return &ChatResponse{
		Content:      content,
		InputTokens:  result.Usage.InputTokens,
		OutputTokens: result.Usage.OutputTokens,
		Model:        req.Model,
		Provider:     p.Name(),
	}, nil
}

func (p *AnthropicProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	if p.apiKey == "" {
		return nil, &ErrProviderUnavailable{Provider: p.Name(), Cause: fmt.Errorf("API key not configured")}
	}

	body := p.buildBody(req, true)
	bodyBytes, _ := json.Marshal(body)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/messages", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("x-api-key", p.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")
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

			var chunk struct {
				Type  string `json:"type"`
				Delta struct {
					Text string `json:"text"`
				} `json:"delta"`
				ContentBlock struct {
					Text string `json:"text"`
				} `json:"content_block"`
			}
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				return true
			}

			content := ""
			if chunk.Delta.Text != "" {
				content = chunk.Delta.Text
			} else if chunk.ContentBlock.Text != "" {
				content = chunk.ContentBlock.Text
			}

			select {
			case ch <- StreamChunk{Content: content}:
			case <-ctx.Done():
				return false
			}
			return true
		})
	}()

	return ch, nil
}

func (p *AnthropicProvider) ListModels(ctx context.Context) ([]ModelInfo, error) {
	return []ModelInfo{
		{ID: "anthropic/claude-sonnet-4-20250514", Name: "Claude Sonnet 4", Provider: "anthropic", InputPricePer1k: 0.003, OutputPricePer1k: 0.015, ContextWindow: 200000, Description: "Balanced intelligence and speed.", Capabilities: []string{"text", "code", "vision"}},
		{ID: "anthropic/claude-opus-4-20250514", Name: "Claude Opus 4", Provider: "anthropic", InputPricePer1k: 0.015, OutputPricePer1k: 0.075, ContextWindow: 200000, Description: "Maximum intelligence for complex tasks.", Capabilities: []string{"text", "code", "vision", "reasoning"}},
		{ID: "anthropic/claude-3-5-haiku-20241022", Name: "Claude 3.5 Haiku", Provider: "anthropic", InputPricePer1k: 0.0008, OutputPricePer1k: 0.004, ContextWindow: 200000, Description: "Fast, cost-effective model.", Capabilities: []string{"text", "code"}},
	}, nil
}

func (p *AnthropicProvider) buildBody(req ChatRequest, stream bool) map[string]interface{} {
	messages := make([]map[string]string, 0, len(req.Messages))
	for _, m := range req.Messages {
		if m.Role == "system" {
			continue
		}
		role := m.Role
		if role == "assistant" {
			role = "assistant"
		}
		messages = append(messages, map[string]string{"role": role, "content": m.Content})
	}
	body := map[string]interface{}{
		"model":    req.Model,
		"messages": messages,
		"stream":   stream,
		"max_tokens": 4096,
	}
	if req.System != "" {
		body["system"] = req.System
	}
	if req.MaxTokens != nil {
		body["max_tokens"] = *req.MaxTokens
	}
	return body
}
