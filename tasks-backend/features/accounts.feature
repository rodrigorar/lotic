@fixture.tasks.server
Feature: Account operations

  # Create account use case

  Scenario: Create an account successfully
    Given a valid new account information
    When it tries to create a new account
    Then a new account is successfully created

  Scenario: Create an account with invalid information
    Given an invalid new account information
    When it tries to create a new account
    Then an error is returned informing of the invalid information

  # Get account Use Case

  Scenario: Get an existing account
    Given an existing account
    When it tries to obtain the account information
    Then return the account information

  Scenario: Get a non existing account
    Given a non existing account
    When it tries to obtain the account information
    Then return account not found