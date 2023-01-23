@fixture.tasks.server
Feature: Account operations

  # Create account use case

  Scenario: Create an account successfully
    Given a valid new account information
    When it tries to create a new account
    Then a new account is successfully created

  Scenario: Create an account with invalid email
    Given an invalid new account information
    When it tries to create a new account
    Then an error is returned informing of the invalid information

  Scenario: Create an account with invalid fields
    Given an invalid new account information
    When it tries to create a new account with invalid field
    Then an error is returned informing of the invalid information

  # Get account Use Case

  Scenario: Get an existing account
    Given an existing account
    When it obtains the account information
    Then validate the account information

  Scenario: Get a non existing account
    Given a non existing account
    When it obtains the account information
    Then validate account not found