# UI Components

## Pages
- [ ] `/login` — LoginPage (Server Component + LoginForm Client Component)
- [ ] `/` → redirect to `/board`
- [ ] `/board` — BoardPage (Server Component, loads tasks + members)
- [ ] `/members` — MembersPage (Server Component + MembersList Client Component)

## Layout
- [ ] AppShell — header z nazwą aplikacji, nav, logout button
- [ ] BoardLayout — trzy kolumny Kanban (responsive: stack na mobile)

## Kanban
- [ ] KanbanBoard — Client Component, dnd-kit DndContext + SortableContext
- [ ] KanbanColumn — dropzone per status (To Do / In Progress / Done), header z count
- [ ] TaskCard — draggable card; title, assignee avatar/initials, drag handle
- [ ] TaskCardSkeleton — placeholder podczas ładowania

## Task CRUD
- [ ] TaskModal — modal do tworzenia i edycji (title, description, assignee select)
- [ ] DeleteConfirmDialog — confirm przed usunięciem taska
- [ ] AddTaskButton — przycisk "+" w każdej kolumnie

## Members
- [ ] MembersList — tabela członków zespołu
- [ ] AddMemberForm — formularz dodawania (name + email)
- [ ] RemoveMemberButton — z potwierdzeniem

## Primitives
- [ ] Button (primary, secondary, ghost, danger, sizes: sm/md/lg)
- [ ] Input (text, email, password z label i error state)
- [ ] Textarea (opis taska)
- [ ] Select (dropdown przypisania do członka)
- [ ] Avatar (inicjały lub fallback gdy brak avatara)
- [ ] Badge (status pill: To Do / In Progress / Done)
- [ ] Toast (sukces/błąd po operacjach — react-hot-toast lub własny)
- [ ] Modal (backdrop + trap focus + Escape to close)
- [ ] Spinner (loading state)

## Accessibility
- Drag & drop: klawiatura (Space to pick up, arrow keys to move, Enter to drop) — dnd-kit wspiera
- Focus trap w modalach
- ARIA labels na kolumnach i kartach
- Kontrast kolorów ≥ 4.5:1 (WCAG AA)
