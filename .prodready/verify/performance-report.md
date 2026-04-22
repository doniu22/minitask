# Performance Report

Generated: 2026-04-22

## Bundle Analysis

Next.js 15 production build (`npm run build`):

| Metric                          | Value        | Target   | Status |
| ------------------------------- | ------------ | -------- | ------ |
| First Load JS (shared)          | 102 kB       | < 200 kB | ✓ Pass |
| Page: /login                    | 103 kB total | —        | ✓      |
| Board (RSC, no extra client JS) | 102 kB total | —        | ✓      |
| Middleware bundle               | 38.9 kB      | —        | ✓      |

All pages use Next.js 15 App Router with React Server Components. The board page renders server-side — only dnd-kit interaction logic ships to the client. No client-side data fetching waterfalls.

## Architecture Performance Characteristics

| Layer         | Approach                                          | Impact               |
| ------------- | ------------------------------------------------- | -------------------- |
| Rendering     | RSC by default; Client Components only for D&D    | Minimal client JS    |
| Data fetching | Server-side in RSC; no client fetch waterfalls    | Fast initial paint   |
| Database      | Prisma with connection pooling                    | Low query overhead   |
| Caching       | `output: 'standalone'` with Next.js cache headers | Static assets cached |
| Proxy         | Caddy with gzip + HTTP/2                          | Compressed responses |

## Database Indexes

| Index                  | Query Pattern                                   | Status |
| ---------------------- | ----------------------------------------------- | ------ |
| `Task.[status, order]` | Board column rendering (ORDER BY status, order) | ✓      |
| `Task.status`          | Column filtering                                | ✓      |
| `Task.assigneeId`      | Member task lookup                              | ✓      |
| `User.email`           | Login lookup (unique constraint)                | ✓      |

No N+1 queries: `GET /api/tasks` joins assignee in a single Prisma query via `include: { assignee: true }`.

## API Response Time Estimates

No live server available in this environment (Docker not active in WSL 2). Estimates based on architecture:

| Endpoint                   | Estimated p50    | Target  |
| -------------------------- | ---------------- | ------- |
| GET /api/health            | < 5ms            | < 100ms |
| GET /api/tasks             | < 30ms           | < 100ms |
| POST /api/tasks            | < 30ms           | < 100ms |
| PATCH /api/tasks/{id}/move | < 30ms           | < 100ms |
| POST /api/auth/login       | < 100ms (bcrypt) | < 200ms |

Note: bcrypt with 12 rounds is intentionally ~80–100ms to prevent brute force.

## Core Web Vitals

No Lighthouse measurement available (requires running app). Architectural indicators:

| Signal                | Evidence                                      | Expected CWV Impact |
| --------------------- | --------------------------------------------- | ------------------- |
| Server-side rendering | All pages are RSC                             | LCP < 2.5s ✓        |
| No layout shift       | Tailwind utility classes, fixed column layout | CLS ≈ 0 ✓           |
| Interactive quickly   | 102 kB first-load JS                          | FID < 100ms ✓       |

## Result

**Status: PASSED (architecture analysis)**

Bundle size and database indexing targets met. Live latency measurements should be validated after first VPS deployment using `/api/health` curl timing and browser DevTools.
