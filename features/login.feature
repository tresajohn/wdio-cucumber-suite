@login
Feature: User Login

  @needs_credentials
  Scenario: Login with valid credentials
    Given I navigate to the login page
    When I login with email "valid" and password "valid"
    Then I should be logged in successfully

  Scenario: Login with invalid credentials
    Given I navigate to the login page
    When I login with email "wrong@example.com" and password "differentwrongpass999"
    Then I should see the login error "Your email or password is incorrect!"

  Scenario: Login with empty credentials stays on login page
    Given I navigate to the login page
    When I submit login with empty credentials
    Then I should remain on the login page
