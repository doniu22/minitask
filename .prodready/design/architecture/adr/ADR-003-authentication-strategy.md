# ADR-003: Authentication Strategy

## Status
Accepted

## Date
2026-04-21

## Context
Aplikacja ma jednego superadmina (seeded z env), bez rejestracji i resetu hasła. Potrzebujemy prostej sesji po logowaniu email/hasło. Członkowie zespołu NIE logują się — są zarządzani przez admina jako rekordy w bazie (tylko imię + email do przypisywania tasków).

## Decision
Używamy **iron-session** z hasłami hashowanymi przez **bcryptjs**.

- iron-session przechowuje sesję w zaszyfrowanym, podpisanym cookie (AES-256-CBC + HMAC-SHA256)
- Cookie: HttpOnly, Secure (HTTPS), SameSite=Lax — odporne na XSS i CSRF
- Superadmin seeded przez `prisma/seed.ts` — hasło z `SEED_ADMIN_PASSWORD` hashowane bcrypt (rounds: 12)
- Next.js middleware (`middleware.ts`) chroni wszystkie trasy poza `/login`
- Sesja zawiera tylko `{ userId: string, role: string }` — minimalne dane

## Consequences

### Positive
- Zero stanu sesji po stronie serwera — skalowalne horyzontalnie bez shared session store
- Brak zewnętrznych zależności od serwisów auth (Auth0, Clerk, itp.)
- Proste do audytu bezpieczeństwa — <200 linii konfiguracji

### Negative
- Brak mechanizmu invalidacji sesji po stronie serwera (np. "wyloguj ze wszystkich urządzeń") — akceptowalne dla MVP
- iron-session cookie ma stałe TTL — logout wymaga nadpisania cookie

### Risks
- `IRON_SESSION_SECRET` musi być silny (≥32 znaki) i nigdy nie commitowany — mitygacja: `.env.example` z placeholder, weryfikacja w CI

## Alternatives Considered
1. **Auth.js (next-auth) v5 z credentials provider**: odrzucone — nadmiarowy boilerplate dla single-admin use case; przydatny przy OAuth, którego nie planujemy w MVP
2. **JWT w localStorage**: odrzucone — podatne na XSS; cookie HttpOnly bezpieczniejsze
3. **Sesja w bazie danych**: odrzucone — dodatkowa tabela i query per request bez benefitów przy tym scale
