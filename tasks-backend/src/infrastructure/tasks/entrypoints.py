from flask import Blueprint, request
from src.domain import LogProvider
from src.domain.errors import InvalidArgumentError
from src.infrastructure import from_json, to_json
from src.infrastructure.tasks.adapters import TasksUseCaseProvider
from src.infrastructure.tasks.payloads import CreateTasksRequest, UpdateTasksRequest
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
tasks_bp = Blueprint("tasks", __name__, url_prefix=URL_PREFIX_V1 + "/tasks")


@tasks_bp.post("")
def create_tasks():
    try:
        request_data = from_json(CreateTasksRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unknown field sent")

    use_case = TasksUseCaseProvider.create_task()
    result = use_case.execute(request_data.to_dto())

    if type(result) == tuple:
        result = {
            "ids": [str(task_id) for task_id in result[0]],
            "tasks_with_errors": [str(errors) for errors in result[1]]
        }
    else:
        result = {
            "ids": [str(task_id) for task_id in result]
        }

    return to_json(result), 200, {'Content-Type': 'application/json'}


@tasks_bp.put("")
def update_tasks():
    try:
        request_data = from_json(UpdateTasksRequest, request.get_data())
    except TypeError:
        raise InvalidArgumentError("Unknown field sent")

    use_case = TasksUseCaseProvider.update_tasks()
    use_case.execute(request_data.to_dto())

    return "", 204


@tasks_bp.delete("/<uuid:task_id>")
def delete_tasks(task_id):
    logger.info("Delete tasks has been called with %s", task_id)

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "Delete tasks has not yet been implemented."
    }), 500, {'Content-Type': 'application/json'}


@tasks_bp.get("")
def list_tasks():
    logger.info("List tasks has been called.")
    user_id = request.args.get("user_id", default="", type=str)

    logger.info("Query Parameter: %s", user_id)

    return to_json({
        "type": "http://localhost:5000/not_implemented",
        "details": "List tasks has not yet been implemented"
    }), 500, {'Content-Type': 'application/json'}
