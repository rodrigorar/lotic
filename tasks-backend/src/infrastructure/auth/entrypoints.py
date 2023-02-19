from flask import Blueprint, request

from src.domain import InvalidArgumentError, LogProvider
from src.infrastructure import from_json, to_json
from src.infrastructure.auth.adapters import AuthUseCaseProvider
from src.infrastructure.auth.payloads import LoginRequest
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
auth_bp = Blueprint("auth", __name__, url_prefix=URL_PREFIX_V1 + "/auth")


@auth_bp.post("/login")
def login():
    logger.info("Endpoint: login")

    try:
        request_data = from_json(LoginRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unkown field sent")

    use_case = AuthUseCaseProvider.login()
    response = use_case.execute(request_data.to_dto())
    print("Token: " + response.token + " Account_id: " + response.account_id)
    return to_json(response), 200, {'Content-Type': 'application/json'}
