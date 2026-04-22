# Architecture Pattern

## Selected Pattern: Fullstack Monolith (Next.js)

## Rationale
Based on:
- Deployment: VPS + Docker (single container)
- Scale: ≤ 100 users, niski ruch, brak potrzeby skalowania poziomego
- Team: solo developer, kilka dni na MVP

Fullstack Monolith w Next.js App Router został wybrany, ponieważ:
- Jeden repo, jeden kontener, jeden deployment — minimalna złożoność operacyjna
- Next.js łączy frontend (React) i backend (Route Handlers / Server Actions) w jednym procesie
- Server Components eliminują waterfall API calls — dane ładują się po stronie serwera, board wyrenderowany od razu
- Brak osobnego API serwera = mniej punktów awarii, mniej konfiguracji CORS

## Structure

```
[Browser]
    │
    ▼
[Next.js App Router — Node.js process]
    ├── /app/(auth)/login        ← Login page (Server Component)
    ├── /app/(board)/            ← Board page (Server Component + Client Islands)
    │       ├── KanbanBoard      ← Client Component (dnd-kit, optimistic UI)
    │       └── TaskModal        ← Client Component (CRUD form)
    ├── /app/api/tasks/          ← Route Handlers (REST API)
    ├── /app/api/members/        ← Route Handlers
    └── /app/api/auth/           ← iron-session login/logout
         │
         ▼
    [Prisma ORM]
         │
         ▼
    [PostgreSQL]
```

## Key Decisions
- **Server Components** renderują board po stronie serwera — zero loading spinners przy pierwszym wejściu
- **Client Components** tylko tam gdzie potrzebna interaktywność: KanbanBoard (D&D), TaskModal (formularze)
- **Route Handlers** (`/api/*`) zamiast Server Actions — prostsze do testowania jednostkowego i dokumentowania w OpenAPI
- **iron-session** przechowuje sesję w zaszyfrowanym, podpisanym cookie — zero stanu po stronie serwera
- **Optimistic UI** w KanbanBoard: status zmienia się natychmiast w UI, rollback przy błędzie sieciowym

## Future Considerations
- Jeśli liczba użytkowników przekroczy ~500 aktywnych jednocześnie — rozważyć wydzielenie API do osobnego serwisu
- Jeśli pojawi się potrzeba real-time — dodać WebSocket lub Server-Sent Events bez zmiany architektury (Next.js wspiera)
- Jeśli potrzebny OAuth — wymiana iron-session na Auth.js z minimal diff
