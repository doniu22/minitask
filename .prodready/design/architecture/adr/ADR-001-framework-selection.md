# ADR-001: Framework Selection

## Status
Accepted

## Date
2026-04-21

## Context
Projekt to fullstack aplikacja Kanban z wymogami: TypeScript, Docker, PostgreSQL, solo developer, kilka dni na MVP. Potrzebujemy frameworka obsługującego zarówno frontend (React, D&D) jak i backend (API, sesja, baza danych).

## Decision
Używamy **Next.js 15 z App Router**.

- Server Components renderują board po stronie serwera — dane z bazy trafiają do HTML bez osobnego fetch z przeglądarki
- Client Components izolowane do KanbanBoard i modali (D&D, formularze)
- Route Handlers (`/api/*`) obsługują CRUD i auth — łatwe do testowania i dokumentowania w OpenAPI
- Jeden proces Node.js, jeden kontener Docker — zero złożoności operacyjnej

## Consequences

### Positive
- Natychmiastowe renderowanie board (Server Components) = core value spełniona z założenia
- Jeden repo i jeden deployment zamiast frontend + backend serwisów
- TypeScript end-to-end bez konfiguracji bridge'a między serwisami

### Negative
- App Router ma stromą krzywą uczenia (Server vs Client boundary)
- Vendor lock-in do Vercel ekosystemu (choć self-hosted Docker w pełni obsługiwany)

### Risks
- Błędne użycie `"use client"` może przypadkowo wysłać za dużo kodu do przeglądarki — mitygacja: code review i bundle analyzer w CI

## Alternatives Considered
1. **Express.js + React (Vite SPA)**: odrzucone — dwa osobne serwisy, więcej konfiguracji Dockera, brak SSR out-of-the-box
2. **Remix**: odrzucone — mniejszy ekosystem, mniej znany użytkownikowi
3. **tRPC + Next.js**: odrzucone — dodatkowa warstwa abstrakcji niepotrzebna przy prostym CRUD; REST łatwiej dokumentować w OpenAPI
