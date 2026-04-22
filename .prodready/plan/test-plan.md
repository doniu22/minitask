# Test Plan

## Testing Strategy

### Test Pyramid

```
        /\
       /  \  E2E (10%) — Playwright
      /----\
     /      \  Integration (30%) — Vitest + supertest
    /--------\
   /          \  Unit (60%) — Vitest
  /------------\
```

**Coverage Target**: 80%+ on `src/lib/` (services, schemas, utils)

---

## Unit Tests

**Framework**: Vitest
**Location**: `tests/unit/`

| Module | What to Test |
|--------|--------------|
| `src/lib/tasks.ts` | `moveTask` order logic: append, insert, move within column, move across columns |
| `src/lib/schemas/` | Zod schema validation: valid input, missing required, invalid types, boundary values |
| Auth utils | bcrypt hash/verify helper if extracted |

---

## Integration Tests

**Framework**: Vitest + supertest (or Next.js `createMocks` from `node-mocks-http`)
**Location**: `tests/integration/`
**Setup**: Isolated test PostgreSQL database; `prisma migrate deploy` + seed before suite

### Auth Endpoints

```
POST /api/auth/login
- [ ] success: valid email + password → 200 with SessionUser, Set-Cookie header
- [ ] wrong password → 401
- [ ] unknown email → 401
- [ ] missing email field → 422
- [ ] missing password field → 422

POST /api/auth/logout
- [ ] authenticated session → 204, cookie cleared
- [ ] no session → 204 (idempotent)

GET /api/auth/me
- [ ] authenticated → 200 with SessionUser
- [ ] unauthenticated → 401
```

### Members Endpoints

```
GET /api/members
- [ ] authenticated → 200 with array
- [ ] unauthenticated → 401

POST /api/members
- [ ] admin, valid body → 201 with member
- [ ] admin, duplicate email → 409
- [ ] admin, missing name → 422
- [ ] non-admin (member role) → 403
- [ ] unauthenticated → 401

DELETE /api/members/{id}
- [ ] admin, existing member → 204; tasks with that assignee have assigneeId = null
- [ ] admin, non-existent id → 404
- [ ] non-admin → 403
- [ ] unauthenticated → 401
```

### Tasks CRUD Endpoints

```
GET /api/tasks
- [ ] authenticated → 200 with ordered array including nested assignee
- [ ] unauthenticated → 401

POST /api/tasks
- [ ] valid body (title only) → 201, status=TODO, order assigned
- [ ] valid body (title + description + assigneeId) → 201
- [ ] missing title → 422
- [ ] empty string title → 422
- [ ] unauthenticated → 401

GET /api/tasks/{id}
- [ ] existing id → 200 with task
- [ ] non-existent id → 404
- [ ] unauthenticated → 401

PATCH /api/tasks/{id}
- [ ] update title → 200
- [ ] update assigneeId to null (unassign) → 200
- [ ] empty string title → 422
- [ ] non-existent id → 404
- [ ] unauthenticated → 401

DELETE /api/tasks/{id}
- [ ] existing id → 204
- [ ] non-existent id → 404
- [ ] unauthenticated → 401
```

### Tasks Move Endpoint

```
PATCH /api/tasks/{id}/move
- [ ] move to different column → 200, status updated, order correct
- [ ] move within same column (reorder) → 200, order updated
- [ ] other tasks in target column shift correctly
- [ ] invalid status value → 422
- [ ] non-existent id → 404
- [ ] unauthenticated → 401
```

---

## E2E Tests

**Framework**: Playwright
**Location**: `tests/e2e/`
**Environment**: Full app + postgres via docker-compose; seeded with test data

### Scenarios (mapped from feature files)

From `authentication.feature`:
- [ ] Login with valid superadmin credentials → board visible
- [ ] Login with wrong password → error message shown, stay on /login
- [ ] Visit /board without session → redirected to /login
- [ ] Logout → redirected to /login, board inaccessible

From `task-management.feature`:
- [ ] Create task with title only → appears in To Do column
- [ ] Create task → persists after page reload
- [ ] Create task with empty title → validation error, not submitted
- [ ] Edit task title → updated title visible on board
- [ ] Delete task with confirmation → task removed from board
- [ ] Delete task cancel → task remains

From `kanban-board.feature`:
- [ ] Drag task from To Do to In Progress (desktop) → status saved after reload
- [ ] Drag task from In Progress to Done → status saved after reload
- [ ] Drag task (touch/mobile viewport) → moves to target column

---

## Test Data

### Fixtures

```typescript
// tests/fixtures/index.ts
export const adminUser = {
  email: 'admin@test.com',
  password: 'TestAdmin123!'
}

export const testMember = {
  name: 'Alice Tester',
  email: 'alice@test.com'
}

export const testTask = {
  title: 'Test task',
  description: 'A task for testing'
}
```

### Database Seed (test environment)

Separate `prisma/seed.test.ts`:
- 1 admin user (`admin@test.com`)
- 2 team members
- 3 tasks (1 per status column)

---

## CI Integration

Runs on every push and pull_request to `main`:

1. **lint** — ESLint + Prettier check
2. **typecheck** — `tsc --noEmit`
3. **test:unit** — `vitest run tests/unit/`
4. **test:integration** — `vitest run tests/integration/` with postgres service container
5. **test:e2e** — `playwright test` with full docker-compose stack (optional on PRs, required on main)

---

## Traceability

| User Story | Feature File | E2E Spec |
|------------|--------------|----------|
| US-001: Login | `authentication.feature` | `auth.spec.ts` |
| US-002: Create task | `task-management.feature` | `tasks.spec.ts` |
| US-003: View board | `kanban-board.feature` | `board.spec.ts` |
| US-004: Edit task | `task-management.feature` | `tasks.spec.ts` |
| US-005: Delete task | `task-management.feature` | `tasks.spec.ts` |
| US-006: Drag & drop | `kanban-board.feature` | `dnd.spec.ts` |
| US-007: Manage members | — (admin flow) | `members.spec.ts` |
| US-008: Assign task | `task-management.feature` | `tasks.spec.ts` |
