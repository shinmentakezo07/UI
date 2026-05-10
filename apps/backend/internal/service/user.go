package service

import (
	"context"

	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/pkg/token"
	"dra-platform/backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo   *repository.UserRepo
	secret string
}

func NewUserService(repo *repository.UserRepo, secret string) *UserService {
	return &UserService{repo: repo, secret: secret}
}

func (s *UserService) Register(ctx context.Context, req domain.SignupRequest) (*domain.User, *domain.AppError) {
	if err := req.Validate(); err != nil {
		return nil, err
	}

	existing, err := s.repo.ByEmail(ctx, req.Email)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if existing != nil {
		return nil, domain.ErrEmailExists
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "password hashing failed", err)
	}

	user, err := s.repo.Create(ctx, req.Name, req.Email, hash, "user")
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "failed to create user", err)
	}
	user.Password = nil
	return user, nil
}

func (s *UserService) Authenticate(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, *domain.AppError) {
	if err := req.Validate(); err != nil {
		return nil, err
	}

	user, err := s.repo.ByEmail(ctx, req.Email)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if user == nil || user.Password == nil {
		return nil, domain.NewError(domain.ErrUnauthorized, 401, "Invalid credentials")
	}

	if !CheckPassword(req.Password, *user.Password) {
		return nil, domain.NewError(domain.ErrUnauthorized, 401, "Invalid credentials")
	}

	token, err := token.Generate(user.ID, user.Email, user.Role, s.secret)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "token generation failed", err)
	}

	user.Password = nil
	return &domain.AuthResponse{User: *user, Token: token}, nil
}

func (s *UserService) GetByID(ctx context.Context, id string) (*domain.User, *domain.AppError) {
	user, err := s.repo.ByID(ctx, id)
	if err != nil {
		return nil, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if user == nil {
		return nil, domain.ErrUserNotFound
	}
	user.Password = nil
	return user, nil
}

func (s *UserService) List(ctx context.Context, page, limit int) ([]domain.User, int, *domain.AppError) {
	users, total, err := s.repo.List(ctx, page, limit)
	if err != nil {
		return nil, 0, domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	for i := range users {
		users[i].Password = nil
	}
	return users, total, nil
}

func (s *UserService) UpdateProfile(ctx context.Context, id, name, email string) *domain.AppError {
	if err := s.repo.UpdateProfile(ctx, id, name, email); err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "failed to update profile", err)
	}
	return nil
}

func (s *UserService) ChangePassword(ctx context.Context, id, currentPassword, newPassword string) *domain.AppError {
	user, err := s.repo.ByID(ctx, id)
	if err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "database error", err)
	}
	if user == nil || user.Password == nil {
		return domain.ErrUserNotFound
	}
	if !CheckPassword(currentPassword, *user.Password) {
		return domain.NewError(domain.ErrUnauthorized, 401, "Current password is incorrect")
	}
	hash, err := HashPassword(newPassword)
	if err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "password hashing failed", err)
	}
	if err := s.repo.UpdatePassword(ctx, id, hash); err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "failed to update password", err)
	}
	return nil
}

func (s *UserService) Delete(ctx context.Context, id string) *domain.AppError {
	if err := s.repo.Delete(ctx, id); err != nil {
		return domain.Wrap(domain.ErrInternal, 500, "failed to delete user", err)
	}
	return nil
}

func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(b), err
}

func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
