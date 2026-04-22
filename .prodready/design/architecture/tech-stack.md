# Tech Stack

## Core

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript 5.x | Type safety end-to-end; user requirement |
| Runtime | Node.js 20 LTS | Stabilna wersja LTS, Docker-friendly |
| Framework | Next.js 15 (App Router) | Fullstack monolith; RSC eliminują API waterfalls |
| Database | PostgreSQL 16 | Relational, robust, user requirement |
| ORM | Prisma 7 | Type-safe queries, migracje, user requirement |
| Auth | iron-session | Minimalna sesja w zaszyfrowanym cookie; zero overhead |
| D&D | dnd-kit | Najlepsze touch support na rynku; tree-shakeable; brak jQuery |
| Styling | Tailwind CSS 4 | Utility-first; zero runtime CSS; świetna responsywność |

## Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Container | Docker + Docker Compose | User requirement; single-container monolith |
| Reverse Proxy | Caddy | Auto HTTPS (Let's Encrypt), zero config dla VPS |
| CI/CD | GitHub Actions | Free tier; integracja z repo |

## Development

| Tool | Purpose |
|------|---------|
| ESLint | Linting (next/core-web-vitals config) |
| Prettier | Formatowanie kodu |
| Vitest | Unit + integracja (user requirement) |
| Playwright | E2E testy (D&D na desktop i mobile) |
| Husky + lint-staged | Git hooks — lint i format przed commitem |

## Versions

```json
{
  "node": "20.x",
  "typescript": "5.x",
  "next": "15.x",
  "react": "19.x",
  "prisma": "7.x",
  "iron-session": "8.x",
  "@dnd-kit/core": "6.x",
  "tailwindcss": "4.x",
  "vitest": "2.x",
  "playwright": "1.x"
}
```

## Authentication

- **Strategy**: Server-side session w zaszyfrowanym cookie (iron-session)
- **Library**: `iron-session` v8
- **Storage**: HttpOnly, Secure, SameSite=Lax cookie
- **Seed**: Superadmin tworzony przez Prisma seed script (`prisma/seed.ts`) z danymi z env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`)
- **Password hashing**: `bcryptjs` (salt rounds: 12)
- **Session data**: `{ userId: string, role: "ADMIN" | "MEMBER" }`
- **Protected routes**: Next.js middleware (`middleware.ts`) — redirect na `/login` jeśli brak sesji

## Monitoring

- **Logging**: `console.error` na serwer (Next.js logi widoczne w Docker logs) — wystarczające dla MVP
- **Error tracking**: brak (future: Sentry)
- **Analytics**: brak
