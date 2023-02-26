import uuid

from flask import Blueprint, request

from src.domain import InvalidArgumentError, LogProvider
from src.infrastructure import from_json, to_json
from src.infrastructure.auth.adapters import AuthUseCaseProvider
from src.infrastructure.auth.payloads import AuthTokenResponse, LoginRequest, LogoutRequest
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
auth_bp = Blueprint("auth", __name__, url_prefix=URL_PREFIX_V1 + "/auth")


@auth_bp.post("/login")
def login():
    logger.info("Endpoint: login")

    try:
        request_data = from_json(LoginRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unknown field received")

    use_case = AuthUseCaseProvider.login()
    result = use_case.execute(request_data.to_dto())
    return to_json(AuthTokenResponse.from_dto(result)), 200, {'Content-Type': 'application/json'}


@auth_bp.post("/refresh/<uuid:refresh_token>")
def refresh(refresh_token):
    logger.info("Endpoint: refresh")

    use_case = AuthUseCaseProvider.refresh()
    result = use_case.execute(refresh_token)
    return to_json(AuthTokenResponse.from_dto(result)), 200, {'Content-Type': 'application/json'}


@auth_bp.post("/logout")
def logout():
    logger.info("Endpoint: logout")

    try:
        request_data = from_json(LogoutRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unknown field received")

    use_case = AuthUseCaseProvider.logout()
    use_case.execute(request_data.to_dto())
    return "", 204
