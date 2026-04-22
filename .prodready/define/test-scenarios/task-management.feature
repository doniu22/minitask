Feature: Task Management
  As a logged-in user
  I want to create, view, edit, and delete tasks
  So that the team can track work items

  Background:
    Given I am logged in as superadmin
    And the board has at least one team member "Jan Kowalski"

  Scenario: [US-002] - Create a task with title only
    Given I am on the board
    When I click "Add task"
    And I enter title "Fix login bug"
    And I submit the form
    Then the task "Fix login bug" appears in the "To Do" column
    And the task persists after page reload

  Scenario: [US-002] - Create a task fails without title
    Given I am on the board
    When I click "Add task"
    And I leave the title empty
    And I submit the form
    Then I see a validation error "Title is required"
    And no new task is created

  Scenario: [US-003] - View tasks organized by status
    Given tasks exist with statuses TODO, IN_PROGRESS, and DONE
    When I load the board
    Then I see three columns: "To Do", "In Progress", "Done"
    And each task appears in the column matching its status
    And each task card shows the title and assignee name

  Scenario: [US-004] - Edit task title
    Given a task "Old title" exists in "To Do"
    When I click on the task and change the title to "New title"
    And I save
    Then the task shows "New title" on the board

  Scenario: [US-004] - Edit task fails without title
    Given a task exists
    When I clear the title and try to save
    Then I see a validation error and the task title is unchanged

  Scenario: [US-005] - Delete a task with confirmation
    Given a task "Delete me" exists on the board
    When I click delete and confirm the action
    Then the task "Delete me" is removed from the board

  Scenario: [US-005] - Cancel task deletion
    Given a task "Keep me" exists on the board
    When I click delete and cancel the confirmation
    Then the task "Keep me" remains on the board
