# Security Audit Report

Generated: 2026-04-22

## Dependency Scan

```
npm audit — 8 moderate severity vulnerabilities

@hono/node-server <1.19.13 (moderate)
  Middleware bypass via repeated slashes in serveStatic
  Path: prisma → @prisma/dev → @hono/node-server
  Impact: DEV TOOL ONLY — Prisma CLI internal server, not in production runtime

esbuild <=0.24.2 (moderate)
  Dev server allows cross-origin requests
  Path: vitest → vite → esbuild
  Impact: DEV TOOL ONLY — test runner only, not in production bundle
```

| Severity | Count | In Production Runtime |
| -------- | ----- | --------------------- |
| Critical | 0     | —                     |
| High     | 0     | —                     |
| Moderate | 8     | 0 (all dev-only)      |
| Low      | 0     | —                     |

**All 8 vulnerabilities are in development-only tooling (Prisma CLI, Vitest). Zero production runtime vulnerabilities.**

## Secrets Detection

No hardcoded secrets found in `src/`. All sensitive values (SESSION_SECRET) are read from `process.env` with validation:

```typescript
// src/lib/session.ts — validates secret length at startup
export function validateSessionSecret(): void {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters')
  }
}
```

`.env` is in `.gitignore`. `.env.example` contains only placeholder values.

## OWASP Top 10 Checklist

| #   | Vulnerability             | Status | Notes                                                                                                                                                                               |
| --- | ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Broken Access Control     | ✓ Pass | Next.js middleware redirects unauthenticated requests; `withAuth`/`withAdminAuth` on every API route; admin-only endpoints (POST/DELETE /members) gated by `role === 'ADMIN'` check |
| A02 | Cryptographic Failures    | ✓ Pass | Passwords hashed with bcryptjs (12 rounds); sessions encrypted with iron-session; cookie is HttpOnly, Secure (prod), SameSite=Lax; SESSION_SECRET validated ≥32 chars               |
| A03 | Injection                 | ✓ Pass | All DB access via Prisma ORM with parameterized queries — no raw SQL; all inputs validated with Zod before reaching DB                                                              |
| A04 | Insecure Design           | ✓ Pass | Auth-by-default middleware; no registration endpoint (seed-only superadmin); tasks scoped to authenticated session                                                                  |
| A05 | Security Misconfiguration | ✓ Pass | Non-root Docker user (appuser); NODE_ENV=production in container; no dev endpoints exposed                                                                                          |
| A06 | Vulnerable Components     | ✓ Pass | 0 vulnerable production dependencies; 8 moderate in dev tools only                                                                                                                  |
| A07 | Auth Failures             | ✓ Pass | Encrypted session cookie; no JWTs to forge; session cleared on logout; invalid credentials return 401 without user enumeration detail                                               |
| A08 | Data Integrity Failures   | ✓ Pass | Zod schemas validate all API inputs (CreateTaskSchema, UpdateTaskSchema, MoveTaskRequest, CreateMemberSchema, LoginSchema) before processing                                        |
| A09 | Logging Failures          | ✓ Pass | `console.error` for server errors only; no passwords, session tokens, or PII in logs                                                                                                |
| A10 | SSRF                      | ✓ Pass | No outbound HTTP requests from the application; no URL inputs accepted from users                                                                                                   |

## Code Review

- [x] No hardcoded secrets in source
- [x] Passwords hashed with bcryptjs (12 rounds)
- [x] Session secret from environment with length validation
- [x] All API inputs validated with Zod schemas
- [x] Auth middleware on all routes (middleware.ts)
- [x] Route-level double-check (`withAuth` / `withAdminAuth`)
- [x] Error responses use generic messages — no stack traces to client
- [x] HttpOnly + Secure + SameSite cookie configuration
- [x] Non-root Docker user

## Issues Found

None requiring remediation before launch. The 8 moderate-severity npm audit findings are in development tools (Prisma CLI internal server, Vitest runner) and do not affect the production image.

## Result

**Status: PASSED**

- Critical: 0
- High: 0
- Moderate: 8 (dev-only, no production impact)
- Low: 0
