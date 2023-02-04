@fixture.tasks.server
Feature: Create Tasks Operation

  Scenario: Valid User tries to create a single task successfully
    Given a valid user
    When it tries to create a task
    Then that task should be successfully created

  Scenario: Valid user tries to create multiple tasks successfully
    Given a valid user
    When it tries to create multiple tasks
    Then those tasks should be successfully created

  Scenario: Multiple user task creation
    Given several users
    When it tries to create multiple tasks
    Then an error should happen for multiple users

  Scenario: Invalid user tries to create tasks
    Given an invalid user
    When it tries to create multiple tasks
    Then an error should happen for user not found