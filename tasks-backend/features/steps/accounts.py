from uuid import uuid4
from behave import *
from src.utils import URL_PREFIX_V1


# Given


@given('a valid new account information')
def step_impl(context):
    context.test_email = 'test.account@mail.not'
    context.test_password = '1234567890'
    context.test_language = 'en'


@given('an invalid new account information')
def step_impl(context):
    context.test_email = 'misamisa-not-email'
    context.test_password = 'qwerty'
    context.test_language = 'en'


@given('an existing account')
def step_impl(context):
    from src.domain.accounts import Account
    from src.application.auth.models import AuthSession

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()
        auth_token = context.db.session.query(AuthSession).filter_by(account_id=account.id).first()

        assert account is not None, 'No account for john.doe@mail.not'

        context.test_account = account
        context.test_account_id = account.get_id()
        context.test_auth_token = str(auth_token.get_id())


@given('a non existing account')
def step_impl(context):
    context.test_account_id = uuid4()
    context.test_auth_token = str(uuid4())


@given('a logged in account')
def step_impl(context):
    from src.domain.accounts import Account
    from src.application.auth.models import AuthSession

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()
        auth_token = context.db.session.query(AuthSession).filter_by(account_id=account.id).first()

        context.test_account_id = account.get_id()
        context.test_auth_token = str(auth_token.get_id())


@given('a request with an unknown access token')
def step_impl(context):
    from src.domain.accounts import Account

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()

        context.test_account_id = account.get_id()
        context.test_auth_token = str(uuid4())


@given('a request with no access token')
def step_impl(context):
    from src.domain.accounts import Account

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()

        context.test_account_id = account.get_id()
        context.test_auth_token = None


# When


@when('it tries to create a new account')
def step_impl(context):
    with context.app.app_context():
        context.result = context.client.post(
            URL_PREFIX_V1 + '/accounts'
            , json={
                "email": context.test_email
                , "password": context.test_password
                , "language": context.test_language
            })


@when('it tries to create a new account with invalid field')
def step_imp(context):
    with context.app.app_context():
        context.result = context.client.post(
            URL_PREFIX_V1 + '/accounts'
            , json={
                "username": context.test_email
                , "password": context.test_password
                , "language": context.test_language
            })


@when('it obtains the account information')
def step_impl(context):
    with context.app.app_context():
        context.result = context.client.get(
            URL_PREFIX_V1 + '/accounts/' + str(context.test_account_id)
            , headers={
                "X-Authorization": context.test_auth_token
            })


@when('it tries to update its own language')
def step_impl(context):
    with context.app.app_context():
        context.result = context.client.put(
            URL_PREFIX_V1 + '/accounts/' + str(context.test_account_id)
            , json={
                'language': 'pt'
                , 'password': None
            }
            , headers={
                'X-Authorization': context.test_auth_token
            }
        )


@when('it tries to update its own password')
def step_impl(context):
    with context.app.app_context():
        context.result = context.client.put(
            URL_PREFIX_V1 + '/accounts/' + str(context.test_account_id)
            , json={
                'language': None
                , 'password': '123456789'
            }
            , headers={
                'X-Authorization': context.test_auth_token
            }
        )


@when('it tries to update another accounts language')
def step_impl(context):
    from src.domain.accounts import Account

    with context.app.app_context():
        another_account = context.db.session.query(Account).filter_by(email='jane.doe@mail.not').first()
        context.result = context.client.put(
            URL_PREFIX_V1 + '/accounts/' + str(another_account.id)
            , json={
                'language': 'pt'
                , 'password': None
            }
            , headers={
                'X-Authorization': context.test_auth_token
            }
        )


@when('it tries to update another accounts password')
def step_impl(context):
    from src.domain.accounts import Account

    with context.app.app_context():
        another_account = context.db.session.query(Account).filter_by(email='jane.doe@mail.not').first()
        context.result = context.client.put(
            URL_PREFIX_V1 + '/accounts/' + str(another_account.id)
            , json={
                'language': None
                , 'password': '123456789'
            }
            , headers={
                'X-Authorization': context.test_auth_token
            }
        )


# Then


@then('a new account is successfully created')
def step_impl(context):
    from src.domain.accounts import Account

    print(context.result.status_code)

    assert context.result is not None
    assert context.result.status_code == 200

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(id=context.result.json["id"]).first()
        assert account is not None
        assert account.email == context.test_email


@then('an error is returned informing of the invalid information')
def step_impl(context):
    assert context.result is not None
    assert context.result.status_code == 400


@then('validate the account information')
def step_impl(context):
    account_info = context.result
    assert account_info is not None
    assert account_info.status_code == 200
    assert account_info.json["id"] == str(context.test_account.get_id())
    assert account_info.json["email"] == context.test_account.email
    assert account_info.json["created_at"] == context.test_account.created_at
    assert account_info.json["updated_at"] == context.test_account.updated_at


@then('validate account not found')
def step_impl(context):
    account_info = context.result
    assert account_info is not None
    assert account_info.status_code == 401


@then('the accounts language should be successfully updated')
def step_impl(context):
    from src.domain.accounts import Account

    assert context.result.status_code == 204

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()
        assert account.language == 'pt'


@then('the accounts password should be successfully updated')
def step_impl(context):
    from src.domain.accounts import Account

    assert context.result.status_code == 204

    with context.app.app_context():
        account = context.db.session.query(Account).filter_by(email='john.doe@mail.not').first()
        assert account.password == '123456789'


@then('it should receive a 403 Forbidden error')
def step_impl(context):
    assert context.result.status_code == 403


@then('it should receive a 401 Unauthorized error')
def step_impl(context):
    assert context.result.status_code == 401
