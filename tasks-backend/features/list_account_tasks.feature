@fixture.tasks.server
Feature: List account tasks operations

  Scenario: List empty tasks for account
    Given a valid user
    When it tries to get account tasks
    Then no tasks should be returned

  Scenario: List a single task for account
    Given a valid user
    When it tries to get the associated task
    Then the task should be returned

  Scenario: List all tasks from account
    Given a valid user
    When it tries to get all associated tasks
    Then all account tasks should be returned