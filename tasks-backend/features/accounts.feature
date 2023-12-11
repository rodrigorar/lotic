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

  # Update Account Use Case

  Scenario: Update account language successfully
    Given a logged in account
    When it tries to update its own language
    Then the accounts language should be successfully updated

  Scenario: Update account password successfully
    Given a logged in account
    When it tries to update its own password
    Then the accounts password should be successfully updated

  # TODO: After authorization has been implemented uncomment these tests

  #Scenario: Fail to update another accounts language
  #  Given a logged in account
  #  When it tries to update another accounts language
  #  Then it should receive a 403 Forbidden error

  #Scenario: Fail to update another accounts password
  #  Given a logged in account
  #  When it tries to update another accounts password
  #  Then it should receive a 403 Forbidden error

  #Scenario: Fail to update the language of a non existing account
  #  Given a request with an unknown access token
  #  When it tries to update its own language
  #  Then it should receive a 401 Unauthorized error

  #Scenario: Fail to update the password of a non existing account
  #  Given a request with an unknown access token
  #  When it tries to update its own password
  #  Then it should receive a 401 Unauthorized error

  #Scenario: Fail to update the language of a non logged in account
  #  Given a request with no access token
  #  When it tries to update another accounts language
  #  Then it should receive a 401 Unauthorized error

  #Scenario: Fail to update the password of a non logged in account
  #  Given a request with no access token
  #  When it tries to update another accounts password
  #  Then it should receive a 401 Unauthorized error

  # Get account Use Case

  Scenario: Get an existing account
    Given an existing account
    When it obtains the account information
    Then validate the account information

  Scenario: Get a non existing account
    Given a non existing account
    When it obtains the account information
    Then validate account not found