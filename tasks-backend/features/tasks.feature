@fixture.tasks.server
Feature: Tasks Operations

  # Create Tasks

  Scenario: Valid User tries to create a single task successfully
    Given a valid user
    When it tries to create a task
    Then that task should be successfully created

  Scenario: Valid user tries to create multiple tasks successfully
    Given a valid user
    When it tries to create multiple tasks
    Then those tasks should be successfully created

  Scenario: A Valid user tries to create empty tasks successfully
    Given a valid user
    When it tries to create tasks with empty array
    Then those tasks should be successfully created

  Scenario: Multiple user task creation
    Given several users
    When it tries to create multiple tasks
    Then an error should happen for multiple users

  Scenario: Invalid user tries to create tasks
    Given an invalid user
    When it tries to create multiple tasks
    Then an error should happen for user not found

  # Update Tasks

  Scenario: Valid user tries to update a single task
    Given a valid user
    When it tries to update a single task
    Then that task should be successfully updated

  Scenario: Valid user tries to update several tasks
    Given a valid user
    When it tries to update several tasks
    Then those tasks should be successfully updated

  Scenario: Valid user tries to update not owned tasks
    Given a valid user
    When it tries to update tasks it does not own
    Then it should receive an authorization error

  Scenario: Valid user tries to update not partially owned tasks
    Given a valid user
    When it tries to update tasks it owns and it does not own
    Then it should receive an authorization error

  Scenario: Valid user tries to update no tasks
    Given a valid user
    When it tries to update an empty task list
    Then those tasks should be successfully updated

  # Delete Tasks

  Scenario: Delete an existing task successfully
    Given a valid user
    When it tries to delete a task
    Then the task should be deleted

  Scenario: Delete a non existing task
    Given a valid user
    When it tries to delete a non existent task
    Then a task not found should be returned

  # List tasks

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