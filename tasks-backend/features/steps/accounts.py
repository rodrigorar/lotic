from behave import *


@given('a valid new account information')
def step_impl(context):
    pass


@given('an invalid new account information')
def step_impl(context):
    print('Invalid account info')


@given('an existing account')
def step_impl(context):
    from src.domain.accounts import Account

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()
        assert account is not None, 'No account for john.doe@mail.not'
        context.test_account = account


@given('a non existing account')
def step_impl(context):
    print('Get a non existing account')


@when('it tries to create a new account')
def step_impl(context):
    print("Call create account api")


@when('it tries to obtain the account information')
def step_impl(context):
    print("Call the account api and get the account information")


@then('a new account is successfully created')
def step_impl(context):
    print("Verify if the account was successfully created")


@then('an error is returned informing of the invalid information')
def step_impl(context):
    print("Deal with the error sent by the server")


@then('return the account information')
def step_impl(context):
    print("verify that the account information was returned as is correct")


@then('return account not found')
def step_impl(context):
    print('No account found')

