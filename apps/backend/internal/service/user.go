package service

import (
	"context"

	"dra-platform/backend/internal/domain"
	"dra-platform/backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo *repository.UserRepo
}

func NewUserService(repo *repository.UserRepo) *UserService {
	return &UserService{repo: repo}
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

func (s *UserService) Authenticate(ctx context.Context, req domain.LoginRequest) (*domain.User, *domain.AppError) {
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

	user.Password = nil
	return user, nil
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
