# ADR-002: Database Choice

## Status
Accepted

## Date
2026-04-21

## Context
Aplikacja przechowuje użytkowników i taski z relacją 1:N. Wymagania: PostgreSQL (user requirement), Docker, scale ≤ 100 użytkowników, dane relacyjne z prostymi zapytaniami (list by status, list by assignee).

## Decision
Używamy **PostgreSQL 16** z **Prisma 7** jako ORM.

- PostgreSQL jako explicite wymaganie z fazy Define
- Prisma generuje typy TypeScript bezpośrednio ze schema — brak ręcznego mapowania typów
- Prisma Migrate obsługuje wersjonowanie schematu — bezpieczne aktualizacje w Dockerze przez `prisma migrate deploy`
- Prisma 7 wymaga `prisma.config.ts` dla połączenia (zamiast `url` w schema.prisma) — już uwzględnione w schema

## Consequences

### Positive
- Type-safe queries bez raw SQL dla standardowych operacji CRUD
- Migracje jako pliki SQL w repozytorium — pełna historia zmian schematu
- `@index` w schema.prisma = automatyczne indeksy dla filtrowania po statusie i assignee

### Negative
- Prisma 7 to nowe API (config file) — mniej przykładów w sieci
- Prisma Client ma startup overhead (~50ms) — akceptowalne dla tego scale

### Risks
- Prisma nie wspiera wszystkich PostgreSQL-specyficznych features (np. partial indexes) — mitygacja: raw SQL przez `$queryRaw` gdy potrzebne

## Alternatives Considered
1. **SQLite**: odrzucone — user requirement (PostgreSQL only)
2. **MongoDB**: odrzucone — user requirement; dane relacyjne lepiej pasują do modelu relacyjnego
3. **Drizzle ORM**: odrzucone — user wybrał Prisma explicite
4. **Raw SQL (pg/postgres.js)**: odrzucone — brak type-safety bez dodatkowego generatora
