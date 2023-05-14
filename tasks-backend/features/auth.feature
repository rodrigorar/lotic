@fixture.tasks.server
Feature: Auth operations

  # Login

  Scenario: Login successfully
    Given a valid account
    When it tries to login
    Then it should receive a valid authorization token

  Scenario: Login with unknown account
    Given an unknown account
    When it tries to login
    Then it should receive a not found error

  Scenario: Login with wrong secret
    Given a valid account with a wrong secret
    When it tries to login
    Then it should receive a forbidden error

  # Refresh

  Scenario: Refresh successfully
    Given a valid account
    When it tries to refresh its token
    Then it should receive a new valid authorization token

  Scenario: Refresh with unknown token
    Given an invalid account
    When it tries to refresh its token
    Then it should receive a forbidden error

  Scenario: Expired Refresh Token
    Given a valid account
    When it tries to refresh its old token
    Then it should receive a forbidden error

  # Logout

  Scenario: Logout successfully
    Given a valid account
    When it tries to logout
    Then it should successfully be logged out

  Scenario: Logout invalid authorization token
    Given a valid account
    When it tries to logout with an invalid auth token
    Then it should continue logged in

  Scenario: Logout no auth sessions
    Given a valid account with no sessions
    When it tries to logout
    Then it should receive a forbidden error