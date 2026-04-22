# Constitution

## Non-Negotiables
- Hasła przechowywane jako hash (bcrypt lub argon2) — nigdy plaintext
- Aplikacja w pełni responsywna i używalna na urządzeniach mobilnych
- Drag & Drop działa na ekranach dotykowych (mobile touch support)
- Brak real-time refresh w MVP — odświeżanie po przeładowaniu strony jest akceptowalne

## Explicit Non-Goals
- Śledzenie czasu pracy (time tracking)
- Wykresy Gantta ani inne widoki harmonogramu
- Customowe przepływy statusów (tylko: To Do → In Progress → Done)
- Integracje z zewnętrznymi narzędziami (Slack, GitHub, itp.)
- Rejestracja użytkowników, reset hasła — auth wyłącznie przez seed superadmina

## Technical Constraints
- Język: TypeScript (frontend i backend)
- Baza danych: PostgreSQL — bez SQLite, bez MongoDB
- Konteneryzacja: aplikacja musi działać w Dockerze
- ORM: do ustalenia w fazie Design

## Timeline & Resources
- Timeline: kilka dni na MVP (jedna sesja z agentem dziennie)
- Team: solo developer
- Constraints: brak — projekt greenfield
