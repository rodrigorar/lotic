from datetime import datetime
import uuid

from behave import *
from dateutil import parser

from src.infrastructure import from_json
from src.utils import URL_PREFIX_V1


@given("a valid account")
def step_impl(context):
    from features.environment import JOHN_DOE_EMAIL, JOHN_DOE_PASSWORD

    context.subject = JOHN_DOE_EMAIL
    context.secret = JOHN_DOE_PASSWORD


@given("a valid account with a wrong secret")
def step_impl(context):
    from features.environment import JOHN_DOE_EMAIL

    context.subject = JOHN_DOE_EMAIL
    context.secret = "wrong-password"


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


@then("it should receive a valid authorization token")
def step_impl(context):
    from src.infrastructure.auth.payloads import AuthTokenResponse
    from features.environment import JOHN_DOE_ID

    assert context.response is not None
    assert context.response.status_code == 200
    auth_response = from_json(AuthTokenResponse, context.response.get_data())

    assert auth_response.token is not None
    assert auth_response.refresh_token is not None
    assert uuid.UUID(auth_response.account_id) == JOHN_DOE_ID
    assert parser.parse(auth_response.expires_at) > datetime.now().astimezone()


@then("it should receive a not found error")
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 404


@then("it should receive a forbidden error")
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 401
