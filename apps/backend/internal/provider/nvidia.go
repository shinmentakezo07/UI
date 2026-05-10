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

type NVIDIAProvider struct {
	apiKey string
	client *http.Client
	baseURL string
}

func NewNVIDIAProvider(apiKey string) *NVIDIAProvider {
	return &NVIDIAProvider{
		apiKey:  apiKey,
		client:  &http.Client{Timeout: 120 * time.Second},
		baseURL: "https://integrate.api.nvidia.com/v1",
	}
}

func (p *NVIDIAProvider) Name() string { return "nvidia" }

func (p *NVIDIAProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
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

func (p *NVIDIAProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
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

func (p *NVIDIAProvider) ListModels(ctx context.Context) ([]ModelInfo, error) {
	return []ModelInfo{
		{ID: "nvidia/qwen3-coder-480b", Name: "Qwen3 Coder 480B", Provider: "nvidia", InputPricePer1k: 0.001, OutputPricePer1k: 0.003, ContextWindow: 128000, Description: "Specialized coding model with strong code generation.", Capabilities: []string{"text", "code"}},
		{ID: "nvidia/llama-3.3-70b-instruct", Name: "Llama 3.3 70B", Provider: "nvidia", InputPricePer1k: 0.0005, OutputPricePer1k: 0.0015, ContextWindow: 128000, Description: "General purpose instruction model.", Capabilities: []string{"text", "chat"}},
		{ID: "nvidia/deepseek-r1", Name: "DeepSeek R1", Provider: "nvidia", InputPricePer1k: 0.0008, OutputPricePer1k: 0.0024, ContextWindow: 128000, Description: "Reasoning-focused model.", Capabilities: []string{"text", "reasoning"}},
	}, nil
}

func (p *NVIDIAProvider) buildBody(req ChatRequest, stream bool) map[string]interface{} {
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
