<div align="center">

# DRA Platform

### Unified AI Gateway — Access, Monitor, and Scale Every Model from One Interface

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go%201.24-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Overview

DRA is a production-grade AI gateway platform that unifies access to multiple AI providers behind a single, elegant interface. It handles authentication, rate limiting, usage tracking, credit-based billing, and real-time analytics — so you can focus on building with AI instead of managing infrastructure.

The stack pairs a cutting-edge **Next.js 16** frontend with a high-performance **Go** backend, orchestrated as a Dockerized monorepo.

---

## What You Get

| Feature | Description |
|---------|-------------|
| **AI Gateway** | Route requests to OpenAI, Anthropic, OpenRouter, NVIDIA NIM, and more through one endpoint |
| **Neural Playground** | Interactive streaming chat interface with model switching and real-time response rendering |
| **API Key Management** | Generate, revoke, and monitor scoped API keys with granular usage controls |
| **Credit System** | Pre-paid credit balances with transaction history and automatic cost deduction |
| **Usage Analytics** | Real-time dashboards tracking tokens, latency, costs, and request volume |
| **Request Logs** | Filterable, paginated audit trail of every API call with full metadata |
| **Admin Console** | User management, platform-wide statistics, and operational controls |
| **Cyberpunk UI** | Dark-themed, motion-rich interface built with Tailwind CSS v4, Framer Motion, and GSAP |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DRA Platform                          │
├─────────────────────┬───────────────────────────────────────┤
│   Next.js 16 (Web)  │         Go Backend (API)              │
│  ┌───────────────┐  │  ┌─────────┐  ┌──────────┐           │
│  │  Dashboard    │  │  │  Auth   │  │  Rate    │           │
│  │  Playground   │◄─┼──┤  JWT +  │  │  Limit   │           │
│  │  Analytics    │  │  │ API Key │  │  CORS    │           │
│  │  Key Manager  │  │  └────┬────┘  └────┬─────┘           │
│  └───────┬───────┘  │       │            │                 │
│          │          │  ┌────┴────────────┴────┐            │
│          │          │  │      Chi Router      │            │
│          │          │  └────┬────────────┬────┘            │
│          ▼          │       │            │                 │
│   ┌─────────────┐   │  ┌────┴───┐   ┌────┴───┐            │
│   │ PostgreSQL  │◄──┼──┤ Keys   │   │ Chat   │            │
│   │ Drizzle ORM │   │  │ Credits│   │ Proxy  │            │
│   └─────────────┘   │  │ Logs   │   │ Admin  │            │
│                     │  └────────┘   └────────┘            │
└─────────────────────┴───────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.9
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/)
- **Charts**: [Recharts](https://recharts.org/)
- **Auth**: [NextAuth.js v5](https://authjs.dev/)

### Backend
- **Runtime**: [Go](https://go.dev/) with [Chi Router](https://github.com/go-chi/chi)
- **Database Driver**: [pgx](https://github.com/jackc/pgx) (connection pooling)
- **Auth**: JWT session validation + API key authentication
- **Rate Limiting**: Per-user sliding window with IP fallback

### Infrastructure
- **Database**: [PostgreSQL](https://www.postgresql.org/) 16
- **ORM / Schema**: [Drizzle ORM](https://orm.drizzle.team/)
- **Monorepo**: [Turborepo](https://turbo.build/)
- **Containers**: [Docker](https://www.docker.com/) + Docker Compose

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 20+
- [Go](https://go.dev/dl/) 1.24+ (for backend development)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Clone & Install

```bash
git clone https://github.com/Shinmen007/DRA.git
cd DRA
npm install
```

### 2. Environment Setup

```bash
cp apps/web/.env.example apps/web/.env.local
```

Generate secrets and fill in your API keys:

```bash
# Required secrets
openssl rand -base64 32  # AUTH_SECRET
openssl rand -base64 32  # NEXTAUTH_SECRET

# AI provider keys (at least one)
# NVIDIA_API_KEY=nvapi-...
# OPENAI_API_KEY=sk-...
```

### 3. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 4. Initialize Database

```bash
cd apps/web
npm run db:setup   # pushes schema + seeds demo data
```

### 5. Run Everything

```bash
# From repository root — starts both frontend and backend
npm run dev
```

| Service | URL |
|---------|-----|
| Web App | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| API Docs | [http://localhost:3000/docs](http://localhost:3000/docs) |

---

## Project Structure

```
DRA/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── app/                # App Router routes
│   │   │   ├── dashboard/      # Analytics, keys, logs, billing
│   │   │   ├── playground/     # Neural Command Center chat UI
│   │   │   ├── gateway/        # AI gateway interface
│   │   │   ├── pricing/        # Credit plans
│   │   │   ├── api/            # Next.js API routes
│   │   │   └── docs/           # API documentation
│   │   ├── db/                 # Drizzle schema & seed
│   │   ├── components/         # Shared UI components
│   │   └── lib/                # Utilities, hooks, API clients
│   └── backend/                # Go backend service
│       ├── cmd/api/            # Application entrypoint
│       └── internal/
│           ├── handlers/       # HTTP route handlers
│           ├── middleware/     # Auth, rate limit, CORS
│           ├── services/       # Business logic
│           ├── repository/     # Data access layer
│           └── models/         # Domain models
├── docker-compose.yml          # Full stack orchestration
├── turbo.json                  # Monorepo task pipeline
└── package.json                # Workspace root
```

---

## API Overview

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/models` | List available AI models |
| `GET` | `/health` | Backend health check |

### Authenticated Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Stream AI completions (SSE) |
| `GET` | `/api/keys` | List API keys |
| `POST` | `/api/keys` | Create new API key |
| `DELETE` | `/api/keys` | Revoke an API key |
| `GET` | `/api/credits` | Credit balance |
| `GET` | `/api/transactions` | Transaction history |
| `GET` | `/api/logs` | Request logs |
| `GET` | `/api/analytics` | Usage analytics |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/stats` | Platform statistics |
| `DELETE` | `/api/admin/users` | Delete user account |

---

## Available Scripts

```bash
# Root
npm run dev      # Start all services in dev mode
npm run build    # Production build
npm run lint     # Lint all packages
npm run format   # Prettier format

# apps/web
npm run db:push  # Push schema changes
npm run db:seed  # Seed demo data
npm run db:setup # Push + seed
npm run test     # Run Vitest suite

# apps/backend
go run ./cmd/api   # Start backend dev server
go build ./cmd/api # Compile binary
docker build -t dra-backend .
```

---

## Deployment

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

Deploys PostgreSQL, the Next.js frontend, and the Go backend as linked containers.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret |
| `NEXTAUTH_SECRET` | Yes | NextAuth session secret |
| `NEXTAUTH_URL` | Yes | Public base URL |
| `BACKEND_URL` | Yes | Go backend URL |
| `NVIDIA_API_KEY` | No | NVIDIA NIM API key |
| `OPENAI_API_KEY` | No | OpenAI API key |

---

## Roadmap

- [x] Multi-provider AI gateway
- [x] Credit-based billing & transactions
- [x] Real-time usage analytics dashboard
- [x] API key lifecycle management
- [x] Neural Command Center playground
- [x] Admin user management
- [ ] Organization / team workspaces
- [ ] Webhook event streaming
- [ ] Fine-grained RBAC permissions
- [ ] Usage alerts & budget caps

---

## License

[MIT](LICENSE)
