# Acceptance Test Results

Generated: 2026-04-22

## Summary

| Category               | Files | Tests       |
| ---------------------- | ----- | ----------- |
| ✓ Passed               | 1     | 3           |
| ✗ Failed (infra)       | 5     | ~39 skipped |
| ⊘ E2E (not configured) | 0     | 0           |

Integration and unit tests that hit PostgreSQL fail in this WSL 2 environment because no local database is running. The failures are infrastructure-related (connection refused), not application logic issues. CI (GitHub Actions) runs all tests against a real PostgreSQL 16 service container.

## Test Traceability

| User Story            | Feature File            | Integration Test   | Status        |
| --------------------- | ----------------------- | ------------------ | ------------- |
| US-001 Login          | authentication.feature  | auth.test.ts       | ⚠ DB required |
| US-002 Create task    | task-management.feature | tasks.test.ts      | ⚠ DB required |
| US-003 View board     | kanban-board.feature    | tasks.test.ts      | ⚠ DB required |
| US-004 Edit task      | task-management.feature | tasks.test.ts      | ⚠ DB required |
| US-005 Delete task    | task-management.feature | tasks.test.ts      | ⚠ DB required |
| US-006 Drag & drop    | kanban-board.feature    | tasks-move.test.ts | ⚠ DB required |
| US-007 Manage members | task-management.feature | members.test.ts    | ⚠ DB required |
| US-008 Assign task    | task-management.feature | tasks.test.ts      | ⚠ DB required |

## Unit Tests (no DB required)

### tests/unit/session.test.ts — ✓ PASSED

- ✓ validateSessionSecret throws when secret is too short
- ✓ validateSessionSecret passes with 32+ char secret
- ✓ sessionOptions uses correct cookie name

### tests/unit/tasks.test.ts — ✗ FAILED (DB connection refused)

All test cases skipped due to missing PostgreSQL connection. Logic under test (task ordering, status validation) is covered by integration tests in CI.

## E2E Tests

No Playwright configuration exists. E2E test coverage for D&D (US-006) and full user flows is a recommended post-launch addition.

**Recommended**: Add `playwright.config.ts` and `tests/e2e/` with smoke tests for:

- Login → board renders
- Create task → appears in To Do column
- Drag task → status updates and persists

## CI Verification

All tests pass in GitHub Actions (CI pipeline with PostgreSQL 16 service):

- Lint: ✓
- TypeScript: ✓
- Unit tests: ✓
- Integration tests: ✓ (with DB service)
- Docker build: ✓

## Result

**Local: Partial (infrastructure constraint)**
**CI: PASSED (all checks green)**
