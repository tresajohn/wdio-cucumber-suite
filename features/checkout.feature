@checkout
Feature: Checkout Flow

  @needs_credentials
  Scenario: Logged-in user can complete checkout
    Given I am logged in as a registered user
    And I have a product in my cart
    When I proceed to checkout from cart
    And I confirm and pay for the order
    Then I should see the order placed confirmation
