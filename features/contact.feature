@contact
Feature: Contact Form

  Scenario: Submit contact form with valid data
    Given I navigate to the contact page
    When I fill in the contact form with valid details
    And I submit the contact form
    Then I should see the contact success message
