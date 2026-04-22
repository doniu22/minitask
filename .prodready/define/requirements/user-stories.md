# User Stories

## Epic 1: Authentication

### US-001: Login as superadmin
**As a** superadmin defined in environment config
**I want to** log in with email and password
**So that** I can access the Kanban board and manage the team's tasks

**Acceptance Criteria**:
- [ ] Given valid credentials, when I submit the login form, then I am redirected to the board
- [ ] Given invalid credentials, when I submit the login form, then I see an error message and stay on the login page
- [ ] Given I am not logged in, when I visit any protected route, then I am redirected to the login page
- [ ] Given my password is stored, then it is stored as a bcrypt/argon2 hash, never plaintext

**Priority**: P0
**Estimate**: S

---

## Epic 2: Task Management (CRUD)

### US-002: Create a task
**As a** logged-in user
**I want to** create a new task with a title, optional description, and assignee
**So that** the team knows what work needs to be done

**Acceptance Criteria**:
- [ ] Given I am on the board, when I click "Add task", then a form appears to enter title (required), description (optional), and assignee (optional)
- [ ] Given I fill in the title and submit, then the task appears in the "To Do" column
- [ ] Given I leave the title empty and submit, then I see a validation error and the task is not created
- [ ] Given I create a task, then it persists after page reload

**Priority**: P0
**Estimate**: S

---

### US-003: View tasks on the board
**As a** logged-in user
**I want to** see all tasks organized by status on the Kanban board
**So that** I have a clear overview of the team's work

**Acceptance Criteria**:
- [ ] Given there are tasks in the database, when I load the board, then I see columns: To Do, In Progress, Done
- [ ] Given each column, when I view it, then it shows all tasks with that status including title and assignee name
- [ ] Given the board loads, then it renders within 1 second on a standard connection

**Priority**: P0
**Estimate**: S

---

### US-004: Edit a task
**As a** logged-in user
**I want to** edit a task's title, description, and assignee
**So that** task information stays up to date

**Acceptance Criteria**:
- [ ] Given I click on a task, when I edit the title and save, then the updated title appears on the board
- [ ] Given I change the assignee and save, then the new assignee is shown on the task card
- [ ] Given I clear the title and save, then I see a validation error and the task is not updated

**Priority**: P0
**Estimate**: S

---

### US-005: Delete a task
**As a** logged-in user
**I want to** delete a task
**So that** completed or irrelevant tasks can be removed from the board

**Acceptance Criteria**:
- [ ] Given I click delete on a task, when I confirm the action, then the task is removed from the board
- [ ] Given I click delete on a task, when I cancel the confirmation, then the task remains on the board

**Priority**: P0
**Estimate**: S

---

## Epic 3: Kanban Board

### US-006: Move task via drag and drop
**As a** logged-in user
**I want to** drag a task card from one column to another
**So that** I can update its status intuitively

**Acceptance Criteria**:
- [ ] Given I drag a task from "To Do" to "In Progress", then the task moves to the "In Progress" column and the status is saved
- [ ] Given I drag a task from "In Progress" to "Done", then the task moves to "Done" and the status is saved
- [ ] Given I am on a touch device, when I long-press and drag a task, then it moves to the target column
- [ ] Given the drag completes, then the new status persists after page reload
- [ ] Given the drag fails (network error), then the task returns to its original column and an error is shown

**Priority**: P0
**Estimate**: L

---

## Epic 4: Team Members

### US-007: Manage team members
**As a** superadmin
**I want to** add and remove team members (name + email)
**So that** tasks can be assigned to the right people

**Acceptance Criteria**:
- [ ] Given I am superadmin, when I add a member with name and email, then they appear in the assignee list
- [ ] Given I remove a member, when I confirm, then they no longer appear in the assignee list (existing task assignments are preserved)
- [ ] Given a member exists, when I try to add the same email again, then I see a duplicate error

**Priority**: P0
**Estimate**: S

---

### US-008: Assign a task to a team member
**As a** logged-in user
**I want to** assign a task to a specific team member
**So that** responsibility is clear

**Acceptance Criteria**:
- [ ] Given a task form is open, when I select a member from a dropdown, then the task shows that member's name on the card
- [ ] Given no member is selected, then the task shows as "Unassigned"

**Priority**: P0
**Estimate**: S
