# Launch Checklist

Project: MiniTask
Date: 2026-04-22
Verified by: ProdReady

## Specification

- [x] All 8 user stories implemented (100%)
- [x] All 12 OpenAPI endpoints match specification
- [x] Data model (prisma/schema.prisma) matches define-phase spec exactly
- [x] Input validation on every endpoint (Zod schemas)

## Security

- [x] No critical/high vulnerabilities in production dependencies
- [x] No secrets in codebase (SESSION_SECRET always from process.env)
- [x] SESSION_SECRET validated ≥32 characters at startup
- [x] OWASP Top 10 addressed (see security-report.md)
- [x] Authentication working (iron-session, HttpOnly cookie)
- [x] Authorization checks in place (withAuth / withAdminAuth + middleware)
- [x] Passwords hashed with bcryptjs (12 rounds)
- [x] Non-root Docker user (appuser)

## Performance

- [x] First Load JS: 102 kB (target < 200 kB)
- [x] RSC by default — minimal client-side JS
- [x] Database indexes on all hot query paths
- [x] No N+1 queries (assignee joined in single query)
- [x] Caddy handles gzip + HTTP/2 in production

## Testing

- [x] Unit tests passing (session logic)
- [x] Integration tests passing in CI (PostgreSQL service)
- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors
- [ ] E2E tests — not yet configured (recommended post-launch)

## Infrastructure

- [x] Dockerfile: multi-stage, non-root user, health check
- [x] docker-compose.prod.yml: app + PostgreSQL + Caddy
- [x] Health check endpoint: GET /api/health
- [x] Environment variables documented in .env.example
- [x] CI pipeline: lint → typecheck → tests → Docker build
- [x] Deploy pipeline: push to GHCR on merge to main

## Documentation

- [x] README.md: setup instructions, architecture, API overview
- [x] DEPLOYMENT.md: VPS deploy guide with Caddy HTTPS
- [x] API documented in .prodready/design/api/openapi.yaml
- [x] .env.example has all required variables

## Pre-Deployment Checklist (complete before going live)

- [ ] VPS provisioned with Docker installed
- [ ] Domain DNS A record pointing to server IP
- [ ] `.env.production` created with strong secrets (`openssl rand -hex 32`)
- [ ] `Caddyfile` updated with real domain name
- [ ] Database credentials secured (not reusing defaults)
- [ ] `docker compose -f docker-compose.prod.yml up -d --build` tested
- [ ] `make prod-migrate` run after first deploy
- [ ] Superadmin seeded (`docker compose exec app npx prisma db seed`)
- [ ] `curl https://your-domain.com/api/health` returns 200
- [ ] Login tested end-to-end in browser
- [ ] UptimeRobot (or equivalent) monitoring configured for `/api/health`
- [ ] Database backup strategy defined

---

## Deployment Command

```bash
# On production server:
make prod-up          # docker compose -f docker-compose.prod.yml up -d
make prod-migrate     # npx prisma migrate deploy in container
make prod-logs        # tail logs to verify startup

# Health check:
curl https://your-domain.com/api/health
```

---

## Result

**PRODUCTION READY**

All automated checks passed. Complete the pre-deployment checklist items before going live.
