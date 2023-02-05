@fixture.tasks.server
Feature: Delete tasks Operation

  Scenario: Delete an existing task successfully
    Given a valid user
    When it tries to delete a task
    Then the task should be deleted

  Scenario: Delete a non existing task
    Given a valid user
    When it tries to delete a non existent task
    Then a task not found should be returned