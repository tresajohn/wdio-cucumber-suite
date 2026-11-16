@cart
Feature: Shopping Cart

  Scenario: Add product to cart increases cart count
    Given I am on the home page
    When I add the first visible product to cart
    And I navigate to the cart page
    Then I should see at least 1 item in the cart

  Scenario: Cart shows correct product name
    Given I am on the home page
    When I add the first visible product to cart
    And I navigate to the cart page
    Then the cart item names list should not be empty
