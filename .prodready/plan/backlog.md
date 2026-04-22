# Implementation Backlog

## Sprint 1: Foundation

### TASK-001: Project Scaffolding
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Initialize Next.js 15 project with App Router, TypeScript strict mode, ESLint, Prettier, Husky + lint-staged, and canonical folder structure.

**Acceptance Criteria**:
- [ ] `npx create-next-app` with App Router + TypeScript
- [ ] `tsconfig.json` strict mode enabled
- [ ] ESLint (next/core-web-vitals) + Prettier configured, no conflicts
- [ ] Husky pre-commit hook: `lint-staged` runs eslint + prettier
- [ ] Folder structure: `src/app`, `src/lib`, `src/types`, `src/components`
- [ ] `npm run dev` starts without errors

**Blocked by**: None
**Blocks**: TASK-002, TASK-003, TASK-004

---

### TASK-002: Docker & Infrastructure Setup
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Create Docker configuration for development (hot-reload) and production (multi-stage build). Include Caddy reverse proxy config for production.

**Acceptance Criteria**:
- [ ] `Dockerfile` with multi-stage build (deps → builder → runner)
- [ ] `docker-compose.yml` for dev: app (with volume mounts) + postgres:16
- [ ] `docker-compose.prod.yml` for prod: app + postgres + caddy
- [ ] `Caddyfile` with HTTPS and reverse proxy to app:3000
- [ ] `.dockerignore` excludes `node_modules`, `.next`, `.env*`
- [ ] `docker compose up` starts app accessible at localhost:3000

**Blocked by**: TASK-001
**Blocks**: None

---

### TASK-003: Database Schema & Prisma Setup
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Configure Prisma 7 with PostgreSQL, apply schema from `.prodready/define/data-model/schema.prisma`, create initial migration, and seed superadmin from env vars.

**Acceptance Criteria**:
- [ ] `prisma/schema.prisma` with User, Task, Member models (from design data model)
- [ ] `Task` model has: id (uuid), title, description?, status (enum), order (int), assigneeId?, timestamps
- [ ] `Member` model has: id (uuid), name, email (unique)
- [ ] `User` model has: id (uuid), email (unique), passwordHash, role (enum ADMIN/MEMBER)
- [ ] `prisma migrate dev` creates migration without errors
- [ ] `prisma/seed.ts` creates superadmin from `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` env vars (bcrypt hash)
- [ ] `prisma db seed` runs successfully against running postgres

**Blocked by**: TASK-001
**Blocks**: TASK-004, TASK-005, TASK-007, TASK-010

---

### TASK-004: iron-session Config & Auth Middleware
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Configure iron-session with typed session data and implement Next.js middleware that redirects unauthenticated requests to `/login`.

**Acceptance Criteria**:
- [ ] `src/lib/session.ts` exports `getSession(req, res)` with typed `SessionData { userId, role }`
- [ ] `SESSION_SECRET` env var used (min 32 chars); validated at startup
- [ ] `middleware.ts` at project root: redirects to `/login` if no valid session on protected routes
- [ ] Public routes (`/login`, `/api/auth/login`) are excluded from middleware
- [ ] Visiting `/` without a session redirects to `/login`

**Blocked by**: TASK-003
**Blocks**: TASK-005, TASK-006

---

## Sprint 2: Auth & Members

### TASK-005: Auth API Endpoints
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Implement `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me` Route Handlers using iron-session and bcryptjs.

**Acceptance Criteria**:
- [ ] `POST /api/auth/login`: validates body with Zod, looks up user by email, verifies bcrypt hash, sets iron-session cookie; returns 401 on bad credentials, 422 on invalid body
- [ ] `POST /api/auth/logout`: destroys session, returns 204
- [ ] `GET /api/auth/me`: returns SessionUser if authenticated, 401 otherwise
- [ ] Passwords never appear in responses or logs
- [ ] Integration tests: login success, login wrong password, login unknown email, logout, me authenticated, me unauthenticated

**Blocked by**: TASK-004
**Blocks**: TASK-006, TASK-008, TASK-010

---

### TASK-006: Login Page UI
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Create the `/login` Server Component page with a Client Component form that calls POST /api/auth/login and redirects on success.

**Acceptance Criteria**:
- [ ] `/app/(auth)/login/page.tsx` — Server Component, redirects to `/` if already authenticated
- [ ] `LoginForm` Client Component: email + password fields, submit button
- [ ] Shows inline error message on 401 (invalid credentials)
- [ ] Redirects to `/` on successful login
- [ ] No console errors; form is keyboard-navigable

**Blocked by**: TASK-005
**Blocks**: None

---

### TASK-007: Members API Endpoints
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Implement `GET /api/members`, `POST /api/members`, and `DELETE /api/members/{id}` Route Handlers. POST and DELETE require ADMIN role.

**Acceptance Criteria**:
- [ ] `GET /api/members`: returns all members array; 401 if unauthenticated
- [ ] `POST /api/members`: validates body (name, email) with Zod; 409 on duplicate email; 403 if not ADMIN; returns created member
- [ ] `DELETE /api/members/{id}`: sets `assigneeId = null` on tasks (preserves tasks); 403 if not ADMIN; 404 if not found; returns 204
- [ ] Integration tests cover all success and error paths

**Blocked by**: TASK-003, TASK-005
**Blocks**: TASK-008, TASK-011

---

### TASK-008: Members Management UI
**Priority**: P1 | **Estimate**: 2h | **Status**: Done

**Description**:
Create a members management panel (admin-only) accessible from the board page. Allows adding and removing team members.

**Acceptance Criteria**:
- [ ] `MembersPanel` Client Component: lists members, add-member form (name + email), remove button per member
- [ ] Add member: shows duplicate email error from API, clears form on success
- [ ] Remove member: shows confirmation before calling DELETE; member disappears from list on success
- [ ] Panel is only rendered for ADMIN role; non-admin sees nothing or read-only list
- [ ] Assignee dropdown elsewhere updates after member is added

**Blocked by**: TASK-007
**Blocks**: None

---

## Sprint 3: Tasks

### TASK-009: Tasks Service Layer
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Implement a Prisma-backed service module for tasks: CRUD operations plus order management logic for status columns.

**Acceptance Criteria**:
- [ ] `src/lib/tasks.ts` (or `src/lib/db/tasks.ts`) exports: `listTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`, `moveTask`
- [ ] `createTask` appends task at end of TODO column (order = max + 1)
- [ ] `moveTask` recalculates order within target column (shifts existing tasks as needed)
- [ ] All functions throw typed errors on not-found / validation failure
- [ ] Unit tests for `moveTask` order logic with edge cases (empty column, move within same column)

**Blocked by**: TASK-003
**Blocks**: TASK-010, TASK-011

---

### TASK-010: Tasks CRUD API Endpoints
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Implement task CRUD Route Handlers: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/{id}`, `PATCH /api/tasks/{id}`, `DELETE /api/tasks/{id}`.

**Acceptance Criteria**:
- [ ] `GET /api/tasks`: returns all tasks ordered by status+order, includes nested assignee object
- [ ] `POST /api/tasks`: Zod-validates body; creates task in TODO; returns 201 with task
- [ ] `GET /api/tasks/{id}`: returns task with assignee; 404 if not found
- [ ] `PATCH /api/tasks/{id}`: partial update (title, description, assigneeId); validates with Zod; 422 on empty title
- [ ] `DELETE /api/tasks/{id}`: returns 204; 404 if not found
- [ ] All endpoints require authentication (401 otherwise)
- [ ] Integration tests for all endpoints including validation errors

**Blocked by**: TASK-005, TASK-009
**Blocks**: TASK-012, TASK-013

---

### TASK-011: Tasks Move API Endpoint
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Implement `PATCH /api/tasks/{id}/move` for drag-and-drop status and order changes.

**Acceptance Criteria**:
- [ ] Validates `{ status, order }` body with Zod
- [ ] Calls `moveTask` service; handles order conflicts atomically (Prisma transaction)
- [ ] Returns updated task on 200; 404 if task not found; 422 on invalid status
- [ ] Integration test: move to same column, move to different column, invalid status

**Blocked by**: TASK-009, TASK-010
**Blocks**: TASK-013, TASK-014

---

### TASK-012: Board Page — Server Component
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Create the `/` board page as a Server Component that fetches tasks and members server-side, rendering the full Kanban layout with no loading spinner on initial load.

**Acceptance Criteria**:
- [ ] `app/(board)/page.tsx` Server Component: fetches tasks + members via Prisma directly (not via fetch)
- [ ] Passes tasks (grouped by status) and members to `KanbanBoard` Client Component
- [ ] Three columns rendered: To Do, In Progress, Done
- [ ] Page renders correct data on hard refresh (no client-side waterfall)
- [ ] Logout button visible; calls POST /api/auth/logout and redirects to /login

**Blocked by**: TASK-010
**Blocks**: TASK-013, TASK-014

---

### TASK-013: KanbanBoard Client Component (dnd-kit)
**Priority**: P0 | **Estimate**: 4h | **Status**: Done

**Description**:
Implement the interactive Kanban board with dnd-kit drag & drop, optimistic UI updates, and rollback on network failure.

**Acceptance Criteria**:
- [ ] `KanbanBoard` Client Component uses `DndContext` + `SortableContext` from dnd-kit
- [ ] Dragging a card between columns calls `PATCH /api/tasks/{id}/move` and updates UI immediately (optimistic)
- [ ] On network error (move fails): task snaps back to original column + shows toast error
- [ ] Touch drag works on mobile (long-press + drag)
- [ ] Drag in progress shows visual placeholder in target column
- [ ] Task cards show: title, assignee name (or "Unassigned")

**Blocked by**: TASK-011, TASK-012
**Blocks**: None

---

### TASK-014: Task Modal — Create & Edit
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Create the Task Modal Client Component for creating new tasks and editing existing ones, triggered from the board.

**Acceptance Criteria**:
- [ ] "Add task" button in each column (or global) opens modal with empty form (status pre-set for column)
- [ ] Clicking a task card opens modal with pre-filled fields
- [ ] Form fields: title (required), description (optional textarea), assignee (dropdown from members list, nullable)
- [ ] Client-side validation: title required; shows error without API call
- [ ] On save: calls POST or PATCH; updates board state; closes modal
- [ ] API validation errors (422) displayed in form
- [ ] ESC key and backdrop click close the modal

**Blocked by**: TASK-010, TASK-012
**Blocks**: TASK-015

---

### TASK-015: Task Delete Confirmation
**Priority**: P0 | **Estimate**: 1h | **Status**: Done

**Description**:
Add a delete action on task cards with a confirmation step before calling DELETE /api/tasks/{id}.

**Acceptance Criteria**:
- [ ] Delete icon/button on task card (visible on hover)
- [ ] Clicking shows confirmation dialog ("Delete task? This cannot be undone.")
- [ ] Confirm: calls DELETE; removes task from board state; shows success toast
- [ ] Cancel: dialog closes; task remains
- [ ] Handles 404 gracefully (task already gone)

**Blocked by**: TASK-014
**Blocks**: None

---

## Sprint 4: Polish

### TASK-016: Zod Schemas & Shared Validation
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
Extract all API input Zod schemas into `src/lib/schemas/` and reuse them in both API Route Handlers (server) and React forms (client-side validation).

**Acceptance Criteria**:
- [ ] `src/lib/schemas/task.ts`: CreateTaskSchema, UpdateTaskSchema, MoveTaskSchema
- [ ] `src/lib/schemas/member.ts`: CreateMemberSchema
- [ ] `src/lib/schemas/auth.ts`: LoginSchema
- [ ] All Route Handlers import from schemas (no inline Zod definitions)
- [ ] React forms use same schemas for client-side validation (react-hook-form + zodResolver or manual)
- [ ] Error messages are user-friendly (not `String must contain at least 1 character(s)`)

**Blocked by**: TASK-010, TASK-007, TASK-005
**Blocks**: None

---

### TASK-017: Global Error Handling & Toast Notifications
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
Implement unified API error response format, React Error Boundary for the board, and a toast notification system for user-facing errors and successes.

**Acceptance Criteria**:
- [ ] All API Route Handlers return `{ code, message }` on error (matches OpenAPI spec)
- [ ] React Error Boundary wraps the board page; shows a friendly fallback UI on unhandled errors
- [ ] Toast system (lightweight — no external lib required; or use `sonner`) shows: drag-drop failure, delete success, member add/remove success
- [ ] No unhandled promise rejections in browser console during normal usage

**Blocked by**: TASK-010, TASK-013
**Blocks**: None

---

### TASK-018: GitHub Actions CI
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
Set up GitHub Actions workflow that runs on every push/PR: lint, typecheck, unit tests, and integration tests (with postgres service container).

**Acceptance Criteria**:
- [ ] `.github/workflows/ci.yml` triggers on `push` and `pull_request` to `main`
- [ ] Jobs: `lint` (eslint + prettier check) → `typecheck` (tsc --noEmit) → `test-unit` → `test-integration` (with `services: postgres`)
- [ ] Integration test job runs `prisma migrate deploy` + `prisma db seed` before tests
- [ ] All jobs pass on a clean checkout
- [ ] Workflow completes in < 5 minutes on a standard runner

**Blocked by**: TASK-010
**Blocks**: None

---

## Task Summary

| Sprint | Tasks | Estimates |
|--------|-------|-----------|
| Sprint 1: Foundation | TASK-001 → TASK-004 | 8h |
| Sprint 2: Auth & Members | TASK-005 → TASK-008 | 9h |
| Sprint 3: Tasks | TASK-009 → TASK-015 | 17h |
| Sprint 4: Polish | TASK-016 → TASK-018 | 6h |
| **Total** | **18 tasks** | **40h** |
