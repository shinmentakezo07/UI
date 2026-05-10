package repository

import (
	"context"

	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

type APIKeyRepo struct {
	db *db.DB
}

func NewAPIKeyRepo(d *db.DB) *APIKeyRepo { return &APIKeyRepo{db: d} }

func (r *APIKeyRepo) ByUser(ctx context.Context, userID string) ([]domain.APIKey, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, user_id, name, key, last_used, created_at, revoked_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`, userID)
	if err != nil { return nil, err }
	defer rows.Close()

	var keys []domain.APIKey
	for rows.Next() {
		var k domain.APIKey
		if err := rows.Scan(&k.ID, &k.UserID, &k.Name, &k.Key, &k.LastUsed, &k.CreatedAt, &k.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

func (r *APIKeyRepo) ByKey(ctx context.Context, key string) (*domain.APIKey, error) {
	row := r.db.Pool.QueryRow(ctx,
		`SELECT id, user_id, name, key, last_used, created_at, revoked_at FROM api_keys WHERE key = $1`, key)
	var k domain.APIKey
	if err := row.Scan(&k.ID, &k.UserID, &k.Name, &k.Key, &k.LastUsed, &k.CreatedAt, &k.RevokedAt); err != nil {
		if err == pgx.ErrNoRows { return nil, nil }
		return nil, err
	}
	return &k, nil
}

func (r *APIKeyRepo) ByID(ctx context.Context, id string) (*domain.APIKey, error) {
	row := r.db.Pool.QueryRow(ctx,
		`SELECT id, user_id, name, key, last_used, created_at, revoked_at FROM api_keys WHERE id = $1`, id)
	var k domain.APIKey
	if err := row.Scan(&k.ID, &k.UserID, &k.Name, &k.Key, &k.LastUsed, &k.CreatedAt, &k.RevokedAt); err != nil {
		if err == pgx.ErrNoRows { return nil, nil }
		return nil, err
	}
	return &k, nil
}

func (r *APIKeyRepo) Create(ctx context.Context, userID, name, key string) (*domain.APIKey, error) {
	id := domain.NewID()
	row := r.db.Pool.QueryRow(ctx,
		`INSERT INTO api_keys (id, user_id, name, key) VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, key, last_used, created_at, revoked_at`,
		id, userID, name, key)
	var k domain.APIKey
	if err := row.Scan(&k.ID, &k.UserID, &k.Name, &k.Key, &k.LastUsed, &k.CreatedAt, &k.RevokedAt); err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *APIKeyRepo) Delete(ctx context.Context, userID, id string) error {
	_, err := r.db.Pool.Exec(ctx, `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}

func (r *APIKeyRepo) Touch(ctx context.Context, id string) error {
	_, err := r.db.Pool.Exec(ctx, `UPDATE api_keys SET last_used = NOW() WHERE id = $1`, id)
	return err
}

func (r *APIKeyRepo) Count(ctx context.Context) (int, error) {
	var n int
	err := r.db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM api_keys`).Scan(&n)
	return n, err
}
