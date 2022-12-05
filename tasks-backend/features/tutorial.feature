@fixture.trailmania.server
Feature: showing off behave

  Scenario: run a simple test
     Given we have behave installed
      When we implement a test
      Then behave will test it for us!

  Scenario: Get Trail Map
    Given a regular user
    When they request for a trail map
    Then behave will test it for us!