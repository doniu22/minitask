# Implementation Plan

## Overview

Project: MiniTask — Lightweight Kanban Board
Pattern: Fullstack Monolith (Next.js 15 App Router)
Stack: Next.js 15, TypeScript 5, PostgreSQL 16, Prisma 7, iron-session 8, dnd-kit 6, Tailwind CSS 4

## Phases

### Phase 1: Foundation (Sprint 1)
**Goal**: Reproducible dev environment and skeleton the app can run on

- Project scaffolding: Next.js 15 App Router + TypeScript strict
- Docker + docker-compose for local dev (app + postgres)
- Prisma schema + initial migration + seed script (superadmin)
- iron-session config + Next.js middleware for protected routes

### Phase 2: Auth & Members (Sprint 2)
**Goal**: Working login flow and member management (prerequisite for tasks)

- Auth API: POST /auth/login, POST /auth/logout, GET /auth/me with bcrypt verification
- Login page UI with form validation and redirect
- Members API: GET /members, POST /members, DELETE /members/{id} (admin-only)
- Members management UI (accessible to superadmin only)

### Phase 3: Tasks (Sprint 3)
**Goal**: Full task CRUD + Kanban board with drag & drop

- Tasks service layer (CRUD + order management)
- Tasks CRUD API: GET /tasks, POST /tasks, GET/PATCH/DELETE /tasks/{id}
- Tasks move API: PATCH /tasks/{id}/move with order recalculation
- Board page: Server Component renders columns with tasks (SSR, no spinner)
- KanbanBoard Client Component with dnd-kit (optimistic UI + rollback)
- Task Modal for create/edit, Task delete confirmation dialog

### Phase 4: Polish (Sprint 4)
**Goal**: Production-ready error handling, validation, and CI

- Zod schemas for all API inputs (shared client/server)
- Global error handling: API error format, toast notifications, Error boundary
- GitHub Actions CI: lint → typecheck → unit tests → integration tests

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| dnd-kit touch support complexity | High | Spike in TASK-014; fallback: ship desktop-only D&D first |
| Order field drift on concurrent moves | Medium | Pessimistic locking in move handler + integration test for concurrent scenario |
| iron-session cookie not forwarded in Vitest integration tests | Medium | Use `supertest` with cookie jar; test helper to inject session |
| Prisma 7 API changes from v5 | Low | Pin exact version in package.json; test migration on clean container |

## Dependencies

External dependencies:
- [ ] PostgreSQL running (via docker-compose — no external account needed)
- [ ] Node.js 20 LTS on dev machine (or run fully in Docker)
- [ ] GitHub repository for CI (GitHub Actions)
- [ ] VPS with Docker for production deployment (out of scope for MVP)
