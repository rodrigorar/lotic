from datetime import datetime
import uuid
from uuid import uuid4

from behave import *
from dateutil import parser

from src.infrastructure import from_json
from src.utils import URL_PREFIX_V1


@given("a valid account")
def step_impl(context):
    from features.environment import JOHN_DOE_EMAIL, JOHN_DOE_PASSWORD, JOHN_DOE_REFRESH_TOKEN, \
        JOHN_DOE_AUTH_TOKEN, JOHN_DOE_ID

    context.account_id = JOHN_DOE_ID
    context.subject = JOHN_DOE_EMAIL
    context.secret = JOHN_DOE_PASSWORD
    context.refresh_token = JOHN_DOE_REFRESH_TOKEN
    context.auth_token = JOHN_DOE_AUTH_TOKEN


@given("a valid account with a wrong secret")
def step_impl(context):
    from features.environment import JOHN_DOE_EMAIL

    context.subject = JOHN_DOE_EMAIL
    context.secret = "wrong-password"


@given("an invalid account")
def step_impl(context):
    context.subject = "some.user@mail.not"
    context.secret = "some-password"
    context.account_id = uuid4()
    context.refresh_token = uuid4()
    context.auth_token = uuid4()


@given("an unknown account")
def step_impl(context):
    context.subject = "unknown@mail.not"
    context.secret = "passwd01"


@when("it tries to login")
def step_impl(context):
    context.response = context.client.post(
        URL_PREFIX_V1 + "/auth/login"
        , json={
            "subject": context.subject
            , "secret": context.secret
        }
        , headers={
            "Content-Type": "application/json"
        })


@when('it tries to refresh its token')
def step_impl(context):
    context.response = context.client.post(
        URL_PREFIX_V1 + "/auth/refresh/" + str(context.refresh_token)
        , headers={
            'X-Authorization': context.auth_token
        })


@then("it should receive a valid authorization token")
def step_impl(context):
    from src.infrastructure.auth.payloads import AuthTokenResponse
    from src.application.auth import AuthSession
    from features.environment import JOHN_DOE_ID

    assert context.response is not None
    assert context.response.status_code == 200
    auth_response = from_json(AuthTokenResponse, context.response.get_data())

    assert auth_response.token is not None
    assert auth_response.refresh_token is not None
    assert uuid.UUID(auth_response.account_id) == JOHN_DOE_ID
    assert parser.parse(auth_response.expires_at) > datetime.now().astimezone()

    with context.app.app_context():
        db_entry = context.db.session.query(AuthSession).filter_by(id=auth_response.token).first()
        assert db_entry is not None
        assert db_entry.id == auth_response.token
        assert db_entry.refresh_token == auth_response.refresh_token
        assert db_entry.account_id == auth_response.account_id
        assert db_entry.expires_at.astimezone() == parser.parse(auth_response.expires_at)


@then("it should receive a not found error")
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 404


@then("it should receive a forbidden error")
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 401


@then("it should receive a new valid authorization token")
def step_impl(context):
    from src.application.auth import AuthSession
    from src.infrastructure.auth.payloads import AuthTokenResponse

    assert context.response is not None
    assert context.response.status_code == 200

    auth_response = from_json(AuthTokenResponse, context.response.get_data())

    assert auth_response.token is not None
    assert auth_response.refresh_token is not None
    assert uuid.UUID(auth_response.account_id) == context.account_id
    assert parser.parse(auth_response.expires_at) > datetime.now().astimezone()

    with context.app.app_context():
        db_entry = context.db.session.query(AuthSession).filter_by(id=auth_response.token).first()
        assert db_entry is not None
        assert db_entry.id == auth_response.token
        assert db_entry.refresh_token == auth_response.refresh_token
        assert db_entry.account_id == auth_response.account_id
        assert db_entry.expires_at.astimezone() == parser.parse(auth_response.expires_at)

