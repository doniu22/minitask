# Vision

## Problem Statement
Istniejące narzędzia Kanban jak Jira czy Trello są zbyt rozbudowane dla małych zespołów realizujących proste projekty. Małe zespoły potrzebują lekkiego narzędzia skupionego wyłącznie na esencji przepływu pracy: tworzeniu tasków, przenoszeniu ich między statusami i przypisywaniu do osób — nic ponadto.

## Target Users
Małe zespoły deweloperskie (2–5 osób) oraz freelancerzy zarządzający pracą dla klientów. Każdy, kto próbował Jiry do prostego projektu i stwierdził, że narzędzie jest nadmiarowo skomplikowane.

## Core Value Proposition
Płynny, natychmiastowy drag-and-drop na Kanban Board — zero opóźnień przy ładowaniu aplikacji i przenoszeniu tasków między statusami.

## Success Metrics
- Czas od rejestracji do utworzenia pierwszego taska: ≤ 30 sekund
- Codzienna retencja: użytkownicy chcą wracać do aplikacji każdego dnia roboczego

## MVP Scope

### Must Have (MVP)
- CRUD tasków ze statusami: To Do, In Progress, Done
- Drag & Drop między kolumnami Kanban
- Przypisywanie tasków do członków zespołu
- Seed user (superadmin) definiowany przez env/JSON; logowanie email + hasło (bez rejestracji, bez resetu hasła)

### Nice to Have (Future)
- Filtrowanie po statusie i przypisanym użytkowniku
- Etykiety (labels)
- Daty deadline (due dates)
- Załączniki do tasków
- Integracje zewnętrzne
- Log historii zmian statusów
