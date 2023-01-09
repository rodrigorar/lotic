from flask import Blueprint, request

from src.domain import LogProvider
from src.infrastructure import to_json
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
user_bp = Blueprint("accounts", __name__, url_prefix=URL_PREFIX_V1 + "/accounts")


@user_bp.post("")
def create_user():
    logger.info("Data: %s" % request.get_data())

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Create User has not yet been implemented."
    }), 500, {'Content-Type': 'application/json'}


@user_bp.get("/<uuid:user_id>")
def get_user(user_id):
    logger.info("Get user has been called.")

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Get user has not yet been implemented."
    }), 500, {'Content-Type': 'application/json'}
