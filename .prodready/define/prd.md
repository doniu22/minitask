# Product Requirements Document (PRD)

## 1. Executive Summary

**Product**: MiniTask — lekki Kanban dla małych zespołów
**Problem**: Jira i Trello są zbyt rozbudowane dla zespołów 2–5 osób realizujących proste projekty. Overhead konfiguracji i złożoność UI spowalniają pracę zamiast ją wspierać.
**Solution**: Minimalna aplikacja Kanban z płynnym drag & drop, natychmiastowym ładowaniem i zerową krzywą uczenia. Nic poza esencją: utwórz task, przypisz, przeciągnij do Done.
**Target Users**: Małe zespoły deweloperskie (2–5 osób), freelancerzy zarządzający pracą klienta.
**Success Metric**: Czas od pierwszego logowania do pierwszego taska ≤ 30 sekund; codzienna retencja aktywnych użytkowników.

---

## 2. Goals & Non-Goals

### Goals
- Płynny, natychmiastowy drag & drop (desktop i touch) jako główna przewaga UX
- CRUD tasków z trzema stałymi statusami: To Do, In Progress, Done
- Przypisywanie tasków do członków zespołu
- Prosta autentykacja przez seeded superadmina (env/JSON)
- Pełna responsywność na urządzeniach mobilnych

### Non-Goals
- Śledzenie czasu pracy, wykresy Gantta, raporty
- Customowe statusy lub przepływy pracy
- Integracje zewnętrzne (Slack, GitHub, itp.)
- Rejestracja użytkowników, reset hasła, OAuth
- Real-time synchronizacja (odświeżanie po reload jest akceptowalne)

---

## 3. User Personas

### Persona 1: Tech Lead małego zespołu
- **Context**: Prowadzi 3-osobowy startup, próbował Jiry — za dużo klikania dla 10 tasków
- **Pain Point**: Konfiguracja narzędzia zajmuje więcej czasu niż samo zadanie
- **Desired Outcome**: Otwiera board, widzi co kto robi, przeciąga Done — koniec

### Persona 2: Freelancer z jednym klientem
- **Context**: Zarządza backlogiem dla klienta, chce pokazać progress bez uczenia klienta Jiry
- **Pain Point**: Klient gubi się w złożonych narzędziach
- **Desired Outcome**: Prosta tablica, którą klient może zrozumieć w 60 sekund

---

## 4. Functional Requirements

### FR-1: Autentykacja
- Jeden superadmin seeded z env/JSON (email + hasło)
- Logowanie przez formularz email/hasło
- Hasło hashowane (bcrypt lub argon2) — nigdy plaintext
- Sesja chroniona; niezalogowani użytkownicy przekierowywani na login
- Brak rejestracji, brak resetu hasła

### FR-2: Zarządzanie taskami
- Tworzenie taska: tytuł (wymagany), opis (opcjonalny), przypisanie (opcjonalne)
- Edycja wszystkich pól taska
- Usunięcie taska z potwierdzeniem
- Nowe taski trafiają do kolumny "To Do"
- Wszystkie zmiany persystowane w PostgreSQL

### FR-3: Kanban Board
- Trzy kolumny: To Do, In Progress, Done
- Drag & drop między kolumnami na desktop i touch (mobile)
- Zmiana statusu przez D&D zapisywana do bazy
- Kolejność tasków w kolumnie zachowana (pole `order`)
- Optymistyczne UI z rollback przy błędzie sieciowym

### FR-4: Członkowie zespołu
- Superadmin dodaje/usuwa członków (imię + email)
- Przypisywanie tasków do członka przez dropdown
- Usunięcie członka nie usuwa jego tasków (assignee → null)

---

## 5. Non-Functional Requirements

- **Performance**: Board renderuje się w ≤ 1s; D&D bez zauważalnych opóźnień (< 16ms frame budget)
- **Security**: Hasła hashowane, sesje po stronie serwera, trasy chronione middleware
- **Availability**: Self-hosted VPS + Docker; brak SLA, downtime akceptowalny dla MVP
- **Scale**: Do 100 użytkowników, niski ruch — brak potrzeby cache'owania ani skalowania poziomego
- **Budget**: Free tier gdzie możliwe; własny VPS

---

## 6. Data Model Summary

### Entities
- **User**: członek zespołu lub superadmin; pola: id, email, name, passwordHash (nullable), role (ADMIN/MEMBER)
- **Task**: zadanie na tablicy; pola: id, title, description?, status (TODO/IN_PROGRESS/DONE), order, assigneeId?

### Key Relationships
- User → Task: jeden użytkownik może być przypisany do wielu tasków (1:N, nullable FK)

---

## 7. Scope & Timeline

- **MVP Features**: autentykacja seed, CRUD tasków, D&D board, przypisywanie członków
- **Future Features**: filtrowanie, etykiety, due dates, załączniki, integracje, log historii statusów
- **Timeline**: kilka dni (jedna sesja z agentem dziennie)
- **Team**: solo developer

---

## 8. Open Questions & Risks

- **D&D na mobile**: wymagane dla MVP — biblioteka (np. dnd-kit) wymaga testowania na rzeczywistych urządzeniach touch; ryzyko regresji na iOS Safari
- **Session management**: Next.js App Router — iron-session lub next-auth w trybie credentials? Do ustalenia w Design
- **Seed mechanism**: format env vs JSON dla superadmina do sprecyzowania w fazie Scaffold

---

## 9. References

- Detailed user stories: `requirements/user-stories.md`
- Data model details: `data-model/entities.md`
- Prisma schema: `data-model/schema.prisma`
- Test scenarios: `test-scenarios/*.feature`
- Constraints: `constraints.md`
- Constitution: `constitution.md`
