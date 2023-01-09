from behave import *


@given('a new user')
def step_impl(context):
    pass


@given('an existing user')
def step_impl(context):
    print('Load a test user id')


@when('it tries to create an account')
def step_impl(context):
    print("Call create account api")


@when('calling the accounts api')
def step_impl(context):
    print("Call the account api and get the account information")


@then('a new account is successfully created')
def step_impl(context):
    print("Verify if the account was successfully created")


@then('the account information should be returned')
def step_impl(context):
    print("verify that the account information was returned as is correct")

