package domain

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  *string   `json:"-"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

func (u *User) IsAdmin() bool { return u.Role == "admin" }

type APIKey struct {
	ID        string     `json:"id"`
	UserID    string     `json:"userId"`
	Name      string     `json:"name"`
	Key       string     `json:"key,omitempty"`
	LastUsed  *time.Time `json:"lastUsed,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
	RevokedAt *time.Time `json:"revokedAt,omitempty"`
}

func (k *APIKey) Masked() string {
	if len(k.Key) > 12 {
		return k.Key[:12] + "..."
	}
	return k.Key
}

func GenerateAPIKey() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate api key: %w", err)
	}
	return "dra_" + hex.EncodeToString(b), nil
}

type APILog struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	APIKeyID     *string   `json:"apiKeyId,omitempty"`
	Model        string    `json:"model"`
	Provider     string    `json:"provider"`
	InputTokens  int       `json:"inputTokens"`
	OutputTokens int       `json:"outputTokens"`
	Cost         int       `json:"cost"`
	Latency      int       `json:"latency"`
	Status       string    `json:"status"`
	ErrorMessage *string   `json:"errorMessage,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
}

type UserCredits struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	Balance        int       `json:"balance"`
	TotalPurchased int       `json:"totalPurchased"`
	TotalSpent     int       `json:"totalSpent"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type CreditTransaction struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	Amount       int       `json:"amount"`
	Type         string    `json:"type"`
	Description  string    `json:"description"`
	RelatedLogID *string   `json:"relatedLogId,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
}

type ModelInfo struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Provider         string   `json:"provider"`
	InputPricePer1k  float64  `json:"inputPricePer1k"`
	OutputPricePer1k float64  `json:"outputPricePer1k"`
	ContextWindow    string   `json:"contextWindow"`
	Description      string   `json:"description"`
	Capabilities     []string `json:"capabilities"`
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *SignupRequest) Validate() *AppError {
	if r.Name == "" || len(r.Name) < 2 {
		return NewError(ErrBadRequest, 400, "Name must be at least 2 characters")
	}
	if r.Email == "" {
		return NewError(ErrBadRequest, 400, "Email is required")
	}
	if r.Password == "" || len(r.Password) < 6 {
		return NewError(ErrBadRequest, 400, "Password must be at least 6 characters")
	}
	return nil
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *LoginRequest) Validate() *AppError {
	if r.Email == "" {
		return NewError(ErrBadRequest, 400, "Email is required")
	}
	if r.Password == "" {
		return NewError(ErrBadRequest, 400, "Password is required")
	}
	return nil
}

type CreateKeyRequest struct {
	Name string `json:"name"`
}

func (r *CreateKeyRequest) Validate() *AppError {
	if r.Name == "" || len(r.Name) > 100 {
		return NewError(ErrBadRequest, 400, "Name must be between 1 and 100 characters")
	}
	return nil
}

type PurchaseRequest struct {
	Amount      int    `json:"amount"`
	Description string `json:"description"`
}

func (r *PurchaseRequest) Validate() *AppError {
	if r.Amount < 1000 {
		return NewError(ErrBadRequest, 400, "Minimum purchase is 1000 credits")
	}
	if r.Amount > 100_000_000 {
		return NewError(ErrBadRequest, 400, "Maximum purchase is 100M credits")
	}
	return nil
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
	Model    string        `json:"model"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func (r *ChatRequest) Validate() *AppError {
	if len(r.Messages) == 0 {
		return NewError(ErrBadRequest, 400, "Messages are required")
	}
	if r.Model == "" {
		r.Model = "qwen/qwen3-coder-480b-a35b-instruct"
	}
	return nil
}

func NewID() string { return uuid.New().String() }
