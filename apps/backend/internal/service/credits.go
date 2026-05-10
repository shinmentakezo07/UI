package service

import (
	"context"

	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/repository"
)

type CreditService struct {
	db          *db.DB
	creditsRepo *repository.CreditsRepo
	txRepo      *repository.TransactionRepo
	logRepo     *repository.LogRepo
}

func NewCreditService(d *db.DB, c *repository.CreditsRepo, t *repository.TransactionRepo, l *repository.LogRepo) *CreditService {
	return &CreditService{db: d, creditsRepo: c, txRepo: t, logRepo: l}
}

func (s *CreditService) GetBalance(ctx context.Context, userID string) (*domain.UserCredits, *domain.AppError) {
	credits, err := s.creditsRepo.ByUser(ctx, userID)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if credits == nil {
		return &domain.UserCredits{UserID: userID, Balance: 0}, nil
	}
	return credits, nil
}

func (s *CreditService) Purchase(ctx context.Context, userID string, req domain.PurchaseRequest) (*domain.CreditTransaction, *domain.AppError) {
	if err := req.Validate(); err != nil {
		return nil, err
	}
	if err := s.creditsRepo.Upsert(ctx, userID, req.Amount, req.Amount); err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "failed to update credits", err)
	}
	desc := req.Description
	if desc == "" {
		desc = "Credit purchase"
	}
	tx, err := s.txRepo.Create(ctx, userID, req.Amount, "purchase", desc, nil)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "failed to record transaction", err)
	}
	return tx, nil
}

func (s *CreditService) DeductForUsage(ctx context.Context, userID string, amount int, logID string) *domain.AppError {
	ok, err := s.creditsRepo.Deduct(ctx, userID, amount)
	if err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "failed to deduct credits", err)
	}
	if !ok {
		return domain.ErrNoCredits
	}
	_, err = s.txRepo.Create(ctx, userID, -amount, "usage", "API usage deduction", &logID)
	if err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "failed to record transaction", err)
	}
	return nil
}

func (s *CreditService) ListTransactions(ctx context.Context, userID string, page, limit int) ([]domain.CreditTransaction, int, *domain.AppError) {
	txs, total, err := s.txRepo.ByUser(ctx, userID, page, limit)
	if err != nil {
		return nil, 0, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	return txs, total, nil
}

func (s *CreditService) CheckBalance(ctx context.Context, userID string, required int) *domain.AppError {
	credits, err := s.creditsRepo.ByUser(ctx, userID)
	if err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if credits == nil || credits.Balance < required {
		return domain.ErrNoCredits
	}
	return nil
}

func (s *CreditService) LogAndDeduct(ctx context.Context, userID string, apiKeyID *string, model string, inputTokens, outputTokens, cost, latency int) (*domain.APILog, *domain.AppError) {
	var result domain.APILog

	err := s.db.WithTx(ctx, func(tx db.Querier) error {
		// 1. Verify balance
		var balance int
		if err := tx.QueryRow(ctx,
			`SELECT balance FROM user_credits WHERE user_id = $1 FOR UPDATE`, userID).Scan(&balance); err != nil {
			return domain.Wrap(domain.ErrInternal, 500, "failed to lock balance", err)
		}
		if balance < cost {
			return domain.ErrNoCredits
		}

		// 2. Insert log
		logID := domain.NewID()
		row := tx.QueryRow(ctx,
			`INSERT INTO api_logs (id, user_id, api_key_id, model, provider, input_tokens, output_tokens, cost, latency, status, error_message)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id, user_id, api_key_id, model, provider, input_tokens, output_tokens, cost, latency, status, error_message, created_at`,
			logID, userID, apiKeyID, model, "nvidia", inputTokens, outputTokens, cost, latency, "success", nil)
		if err := row.Scan(&result.ID, &result.UserID, &result.APIKeyID, &result.Model, &result.Provider,
			&result.InputTokens, &result.OutputTokens, &result.Cost, &result.Latency, &result.Status, &result.ErrorMessage, &result.CreatedAt); err != nil {
			return domain.Wrap(domain.ErrInternal, 500, "failed to create log", err)
		}

		// 3. Deduct credits
		if _, err := tx.Exec(ctx,
			`UPDATE user_credits SET balance = balance - $2, total_spent = total_spent + $2, updated_at = NOW() WHERE user_id = $1`,
			userID, cost); err != nil {
			return domain.Wrap(domain.ErrInternal, 500, "failed to deduct credits", err)
		}

		// 4. Record transaction
		txID := domain.NewID()
		if _, err := tx.Exec(ctx,
			`INSERT INTO credit_transactions (id, user_id, amount, type, description, related_log_id) VALUES ($1, $2, $3, $4, $5, $6)`,
			txID, userID, -cost, "usage", "API usage deduction", result.ID); err != nil {
			return domain.Wrap(domain.ErrInternal, 500, "failed to record transaction", err)
		}

		return nil
	})

	if err != nil {
		if appErr, ok := err.(*domain.AppError); ok {
			return nil, appErr
		}
		return nil, domain.Wrap(domain.ErrInternal, 500, "billing transaction failed", err)
	}

	return &result, nil
}
