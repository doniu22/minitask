Feature: Kanban Board Drag and Drop
  As a logged-in user
  I want to drag task cards between columns
  So that I can update task status intuitively

  Background:
    Given I am logged in as superadmin
    And a task "Implement API" exists in the "To Do" column

  Scenario: [US-006] - Drag task from To Do to In Progress (desktop)
    Given I am on a desktop browser
    When I drag the task "Implement API" to the "In Progress" column
    Then the task appears in "In Progress"
    And after page reload the task is still in "In Progress"

  Scenario: [US-006] - Drag task from In Progress to Done (desktop)
    Given a task "Write tests" is in "In Progress"
    When I drag it to the "Done" column
    Then the task appears in "Done"
    And the status is persisted after reload

  Scenario: [US-006] - Drag task on touch device (mobile)
    Given I am on a mobile touch device
    When I long-press the task "Implement API" and drag it to "In Progress"
    Then the task moves to "In Progress"
    And the status is saved

  Scenario: [US-006] - Drag fails due to network error
    Given the network is unavailable
    When I drag a task to a different column
    Then the task returns to its original column
    And I see an error notification

Feature: Team Member Management
  As a superadmin
  I want to manage team members
  So that tasks can be assigned to the right people

  Background:
    Given I am logged in as superadmin

  Scenario: [US-007] - Add a team member
    When I add a member with name "Anna Nowak" and email "anna@example.com"
    Then "Anna Nowak" appears in the assignee dropdown

  Scenario: [US-007] - Remove a team member
    Given "Anna Nowak" is a team member assigned to a task
    When I remove "Anna Nowak" and confirm
    Then "Anna Nowak" no longer appears in the assignee dropdown
    And the task previously assigned to her still exists (unassigned)

  Scenario: [US-007] - Duplicate email rejected
    Given "anna@example.com" is already a team member
    When I try to add another member with the same email
    Then I see an error "Email already exists"

  Scenario: [US-008] - Assign task to team member
    Given a task "Design UI" is unassigned
    When I open the task and select "Jan Kowalski" as assignee
    And I save
    Then the task card shows "Jan Kowalski"

  Scenario: [US-008] - Unassigned task shows placeholder
    Given a task has no assignee
    Then the task card shows "Unassigned"
