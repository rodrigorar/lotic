from flask import Blueprint, request

from src.domain import LogProvider
from src.infrastructure import to_json
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
accounts_bp = Blueprint("accounts", __name__, url_prefix=URL_PREFIX_V1 + "/accounts")


@accounts_bp.post("")
def create_account():
    logger.info("Data: %s" % request.get_data())
    input

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Create User has not yet been implemented."
    }), 500, {'Content-Type': 'application/json'}


@accounts_bp.get("/<uuid:account_id>")
def get_account(account_id):
    logger.info("Get accounts has been called.")

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Get accounts has not yet been implemented."
    }), 500, {'Content-Type': 'application/json'}
