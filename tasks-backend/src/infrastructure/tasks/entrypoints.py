import uuid

from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field

from src.domain import LogProvider
from src.infrastructure import to_json
from src.infrastructure.error_handlers import ConflictResponse, GenericErrorResponse, \
    NotFoundResponse, \
    UnauthorizedResponse
from src.infrastructure.tasks.payloads import CreateTasksRequest, CreateTasksResponse, \
    ListTasksResponse, UpdateTasksRequest
from src.infrastructure.tasks import TasksUseCaseProvider
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()
tasks_bp = APIBlueprint(
    "tasks"
    , __name__
    , abp_tags=[Tag(name="Tasks", description="Task Operations APIs")]
    , url_prefix=URL_PREFIX_V1 + "/tasks"
    , doc_ui=True)


@tasks_bp.post(
    ""
    , responses={
        "200": CreateTasksResponse
        , "401": UnauthorizedResponse
        , "404": NotFoundResponse
        , "409": ConflictResponse
        , "500": GenericErrorResponse
    }
)
def create_tasks(body: CreateTasksRequest):
    logger.info("Endpoint: Create Tasks")
    use_case = TasksUseCaseProvider.create_task()
    result = use_case.execute(body.to_dto())

    if type(result) == tuple:
        result = {
            "ids": [str(task_id) for task_id in result[0]],
            "tasks_with_errors": [str(errors) for errors in result[1]]
        }
    else:
        result = CreateTasksResponse(result)

    return to_json(result), 200, {'Content-Type': 'application/json'}


@tasks_bp.put(
    ""
    , responses={
        "204": None
        , "401": UnauthorizedResponse
        , "404": NotFoundResponse
        , "500": GenericErrorResponse
    }
)
def update_tasks(body: UpdateTasksRequest):
    logger.info("Endpoint: Update tasks")
    use_case = TasksUseCaseProvider.update_tasks()
    use_case.execute(body.to_dto())
    return "", 204


class DeleteTaskPath(BaseModel):
    task_id: str = Field(None, description="Task id to be deleted")


@tasks_bp.delete(
    "/<task_id>"
    , responses={
        "204": None
        , "401": UnauthorizedResponse
        , "404": NotFoundResponse
        , "500": GenericErrorResponse
    }
)
def delete_tasks(path: DeleteTaskPath):
    logger.info("Endpoint: Delete task " + str(path.task_id))
    use_case = TasksUseCaseProvider.delete_tasks()
    use_case.execute([uuid.UUID(path.task_id)])
    return "", 204


class ListTasksQuery(BaseModel):
    account_id: str = Field(None, description="Account to be use to list the tasks")


@tasks_bp.get(
    ""
    , responses={
        "200": ListTasksResponse
        , "401": UnauthorizedResponse
        , "500": GenericErrorResponse
    }
)
def list_tasks(query: ListTasksQuery):
    logger.info("Endpoint: List tasks for account " + query.account_id)
    use_case = TasksUseCaseProvider.list_tasks_for_user()
    result = use_case.execute(uuid.UUID(query.account_id))
    return to_json(ListTasksResponse(result)), 200, {'Content-Type': 'application/json'}
