@product_search
Feature: Product Search

  Scenario: Search returns results for valid keyword
    Given I am on the home page
    When I search for "Top"
    Then I should see at least 1 product in the results

  Scenario: Search returns no results for unknown keyword
    Given I am on the home page
    When I search for "xyznonexistent999"
    Then I should see 0 products in the results
