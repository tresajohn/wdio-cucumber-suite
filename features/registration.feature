@registration
Feature: User Registration

  Scenario: Register a new account with unique email
    Given I navigate to the login page
    When I sign up with a unique email and name "Portfolio QA"
    Then I should see the account created confirmation

  Scenario: Register with an already-used email shows error
    Given I navigate to the login page
    When I sign up with email "wrong@example.com" and name "Any Name"
    Then I should see the signup error "Email Address already exist!"
