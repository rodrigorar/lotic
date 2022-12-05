from behave import *


@given('we have behave installed')
def step_impl(context):
    pass


@given('a regular user')
def step_impl(context):
    print('a regular user')


@when('we implement a test')
def step_impl(context):
    assert True is not False


@when('they request for a trail map')
def step_impl(context):
    print('trail map requested')


@then('behave will test it for us!')
def step_impl(context):
    assert context.failed is False
