package repository

import (
	"context"

	"dra-platform/backend/internal/db"
	"dra-platform/backend/internal/domain"

	"github.com/jackc/pgx/v5"
)

func GetUserByAPIKey(ctx context.Context, db *db.DB, key string) (*domain.User, *domain.APIKey, error) {
	row := db.Pool.QueryRow(ctx, `
		SELECT u.id, u.name, u.email, u.password, u.role, u.created_at,
		       k.id, k.user_id, k.name, k.key, k.last_used, k.created_at, k.revoked_at
		FROM api_keys k
		JOIN users u ON u.id = k.user_id
		WHERE k.key = $1 AND k.revoked_at IS NULL
	`, key)

	var u domain.User
	var k domain.APIKey
	err := row.Scan(
		&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt,
		&k.ID, &k.UserID, &k.Name, &k.Key, &k.LastUsed, &k.CreatedAt, &k.RevokedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows { return nil, nil, nil }
		return nil, nil, err
	}
	return &u, &k, nil
}
