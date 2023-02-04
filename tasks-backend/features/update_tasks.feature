@fixture.tasks.server
Feature: Update tasks operation

  Scenario: Valid user tries to update a single task
    Given a valid user
    When it tries to update a single task
    Then that task should be successfully updated

  Scenario: Valid user tries to update several tasks
    Given a valid user
    When it tries to update several tasks
    Then those tasks should be successfully updated
