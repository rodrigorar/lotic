import uuid

from flask import request
from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field

from src.domain import InvalidArgumentError, LogProvider
from src.infrastructure import from_json, to_json
from src.infrastructure.auth.adapters import AuthUseCaseProvider
from src.infrastructure.auth.payloads import AuthTokenResponse, LoginRequest, LogoutRequest
from src.infrastructure.error_handlers import BadRequestResponse, ConflictResponse, \
    GenericErrorResponse, NotFoundResponse, UnauthorizedResponse
from src.utils import URL_PREFIX_V1

auth_bp = APIBlueprint(
    "/auth"
    , __name__
    , abp_tags=[Tag(name="Authentication", description="Auth APIs")]
    , url_prefix=URL_PREFIX_V1 + "/auth"
    , doc_ui=True)


@auth_bp.post(
    "/login"
    , responses={
        "200": AuthTokenResponse
        , "401": UnauthorizedResponse
        , "500": GenericErrorResponse
    }
)
def login(body: LoginRequest):
    use_case = AuthUseCaseProvider.login()
    result = use_case.execute(body.to_dto())
    return to_json(AuthTokenResponse.from_dto(result))


class RefreshTokenPath(BaseModel):
    refresh_token: str = Field(None, description="Refresh token")


@auth_bp.post(
    "/refresh/<refresh_token>"
    , responses={
        "200": AuthTokenResponse
        , "401": UnauthorizedResponse
        , "500": GenericErrorResponse
    }
)
def refresh(path: RefreshTokenPath):
    use_case = AuthUseCaseProvider.refresh()
    result = use_case.execute(uuid.UUID(path.refresh_token))
    return to_json(AuthTokenResponse.from_dto(result)), 200, {"Content-Type": "application/json"}


class LogoutSessionTokenPath(BaseModel):
    access_token: str = Field(None, description="Access Token")


@auth_bp.delete(
    "/<access_token>"
    , responses={
        "204": None
        , "401": UnauthorizedResponse
        , "500": GenericErrorResponse
    })
def logout_session(path: LogoutSessionTokenPath):
    use_case = AuthUseCaseProvider.logout_session()
    use_case.execute(uuid.UUID(path.access_token))
    return "", 204


# DEPRECATED: To be Removed
@auth_bp.post(
    "/logout"
    , responses={
        "204": None
        , "401": UnauthorizedResponse
        , "404": NotFoundResponse
        , "500": GenericErrorResponse
    }
)
def logout():
    try:
        request_data = from_json(LogoutRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unknown field received")

    use_case = AuthUseCaseProvider.logout()
    use_case.execute(request_data.to_dto())
    return "", 204
