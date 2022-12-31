from urllib import request

from flask import Blueprint

from src.domain import LogProvider
from src.infrastructure import to_json
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
tasks_bp = Blueprint("tasks", __name__, url_prefix=URL_PREFIX_V1 + "/tasks")


@tasks_bp.post("")
def create_tasks():
    logger.info("Create Task has been called")

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Create tasks has not yet been implemented."
    }), 500


@tasks_bp.put("")
def update_tasks():
    logger.info("Update tasks has been called")

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Update tasks has not yet been implemented."
    }), 500


@tasks_bp.delete("")
def delete_tasks():
    logger.info("Delete tasks has been called")

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Delete tasks has not yet been implemented."
    }), 500


@tasks_bp.get("")
def list_tasks():
    logger.info("List tasks has been called.")
    user_id = request.args.get("user_id", default="", type=str)

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "List tasks has not yet been implemented"
    }), 500
