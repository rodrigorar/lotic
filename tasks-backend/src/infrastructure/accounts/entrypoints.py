from flask import Blueprint, request

from src.domain import LogProvider
from src.infrastructure import from_json, to_json
from src.infrastructure.accounts.adapters import AccountUseCaseProvider
from src.infrastructure.accounts.payloads import CreateAccountRequest
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
accounts_bp = Blueprint("accounts", __name__, url_prefix=URL_PREFIX_V1 + "/accounts")


@accounts_bp.post("")
def create_account():
    request_data = from_json(CreateAccountRequest, request.get_data())
    use_case = AccountUseCaseProvider.create_account()

    result = use_case.execute(request_data.to_dto())

    return to_json({
        "id": result
    }), 200, {'Content-Type': 'application/json'}


@accounts_bp.get("/<uuid:account_id>")
def get_account(account_id):
    use_case = AccountUseCaseProvider.get_account()
    result = use_case.execute(account_id)

    return to_json(
        result
    ), 200, {'Content-Type': 'application/json'}
