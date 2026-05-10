package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port            string
	DatabaseURL     string
	AuthSecret      string
	NvidiaAPIKey    string
	OpenAIAPIKey    string
	AnthropicAPIKey string
	Env             string

	RateLimitRPM    int
	RateLimitWindow time.Duration

	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration

	EnableMetrics bool
	MetricsPort   string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:            getEnv("PORT", "8080"),
		DatabaseURL:     mustGetEnv("DATABASE_URL"),
		AuthSecret:      mustGetEnv("AUTH_SECRET"),
		NvidiaAPIKey:    getEnv("NVIDIA_API_KEY", ""),
		OpenAIAPIKey:    getEnv("OPENAI_API_KEY", ""),
		AnthropicAPIKey: getEnv("ANTHROPIC_API_KEY", ""),
		Env:             getEnv("ENV", "development"),
		RateLimitRPM:    getEnvInt("RATE_LIMIT_RPM", 60),
		RateLimitWindow: time.Minute,
		RequestTimeout:  getEnvDuration("REQUEST_TIMEOUT", 30*time.Second),
		ShutdownTimeout: getEnvDuration("SHUTDOWN_TIMEOUT", 10*time.Second),
		EnableMetrics:   getEnvBool("ENABLE_METRICS", true),
		MetricsPort:     getEnv("METRICS_PORT", "9090"),
	}

	if cfg.AuthSecret == "" {
		return nil, fmt.Errorf("AUTH_SECRET is required")
	}

	return cfg, nil
}

func (c *Config) IsDevelopment() bool { return c.Env == "development" }
func (c *Config) IsProduction() bool  { return c.Env == "production" }

func (c *Config) AIAPIKey() string {
	if c.NvidiaAPIKey != "" {
		return c.NvidiaAPIKey
	}
	return c.OpenAIAPIKey
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required environment variable %s is not set", key))
	}
	return v
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return i
}

func getEnvBool(key string, fallback bool) bool {
	v := strings.ToLower(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v == "true" || v == "1" || v == "yes"
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return fallback
	}
	return d
}
