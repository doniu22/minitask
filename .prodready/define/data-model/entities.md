# Data Model

## Entities

### User
Reprezentuje członka zespołu lub superadmina. Superadmin jest tworzony przez seed (env/JSON), zwykli członkowie dodawani przez superadmina.

- id: UUID
- email: String (unique)
- name: String
- passwordHash: String (tylko dla superadmina)
- role: Enum (ADMIN, MEMBER)
- createdAt: DateTime
- updatedAt: DateTime

### Task
Pojedyncze zadanie na tablicy Kanban.

- id: UUID
- title: String
- description: String? (opcjonalny)
- status: Enum (TODO, IN_PROGRESS, DONE)
- order: Int (pozycja w kolumnie, do sortowania)
- assigneeId: UUID? (FK → User, opcjonalny)
- createdAt: DateTime
- updatedAt: DateTime

## Relationships
- User 1:N Task (jeden użytkownik może być przypisany do wielu tasków)

## Indexes
- User.email (unique)
- Task.status (dla zapytań filtrujących po kolumnie)
- Task.assigneeId (dla zapytań po przypisaniu)
- Task.(status, order) (dla sortowania w kolumnach)
