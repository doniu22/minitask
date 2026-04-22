# MiniTask

A lightweight Kanban board for small teams. Drag tasks between **To Do**, **In Progress**, and **Done** columns — nothing more, nothing less.

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Development

```bash
# Clone repository
git clone https://github.com/your-org/minitask.git
cd minitask

# Copy environment file and edit if needed
cp .env.example .env

# Start development environment (app + PostgreSQL)
make dev

# Open http://localhost:3000
```

Or use the setup script for a one-step start (runs migrations and seeds the admin account):

```bash
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### Running Tests

```bash
make test              # All tests (unit + integration)
make test-unit         # Unit tests only
make test-integration  # Integration tests only
make test-coverage     # Tests with coverage report
```

### Code Quality

```bash
make lint       # ESLint
make typecheck  # TypeScript
make format     # Prettier
```

## Environment Variables

| Variable              | Required | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string               |
| `SESSION_SECRET`      | Yes      | Encryption key for sessions (min 32 chars) |
| `SEED_ADMIN_EMAIL`    | Yes      | Superadmin email created on first seed     |
| `SEED_ADMIN_PASSWORD` | Yes      | Superadmin password                        |

See `.env.example` for all options and defaults.

## Architecture

Single-container Next.js 15 (App Router) monolith backed by PostgreSQL 16.

- **Frontend**: Next.js 15 (RSC + Client Components), Tailwind CSS 4, dnd-kit
- **Backend**: Next.js Route Handlers
- **Database**: PostgreSQL 16 via Prisma 7
- **Auth**: iron-session (encrypted HttpOnly cookie)
- **Proxy**: Caddy (auto HTTPS in production)

See `.prodready/design/architecture/` for ADRs and detailed architecture docs.

## API Documentation

REST API is documented in `.prodready/design/api/openapi.yaml`.

Base URL: `http://localhost:3000/api`

Main endpoints:

- `POST /api/auth/login` / `POST /api/auth/logout`
- `GET /api/tasks` / `POST /api/tasks`
- `PATCH /api/tasks/:id` / `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/move` — move task between columns
- `GET /api/members` — list team members
- `GET /api/health` — health check

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the production deployment guide (VPS + Docker Compose + Caddy with automatic HTTPS).

## Available Commands

```bash
make help   # List all commands with descriptions
```

## License

MIT
