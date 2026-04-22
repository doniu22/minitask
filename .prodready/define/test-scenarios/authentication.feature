Feature: Authentication
  As a superadmin
  I want to log in with email and password
  So that I can access the Kanban board

  Background:
    Given the superadmin account is seeded with email "admin@example.com" and a hashed password

  Scenario: [US-001] - Successful login
    Given I am on the login page
    When I enter valid email "admin@example.com" and correct password
    And I submit the login form
    Then I am redirected to the Kanban board

  Scenario: [US-001] - Login with wrong password
    Given I am on the login page
    When I enter email "admin@example.com" and an incorrect password
    And I submit the login form
    Then I see an error message "Invalid credentials"
    And I remain on the login page

  Scenario: [US-001] - Access protected route while unauthenticated
    Given I am not logged in
    When I navigate to the board page
    Then I am redirected to the login page

  Scenario: [US-001] - Password stored as hash
    Given the superadmin is seeded
    When I query the database for the user record
    Then the passwordHash field is not equal to the plaintext password
