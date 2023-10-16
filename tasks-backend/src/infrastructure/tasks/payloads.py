import uuid

from dateutil import parser
from pydantic import BaseModel, Field

from src.application.tasks import TaskDTO


class CreateTaskRequest(BaseModel):
    id: str = Field(None, description="Task id")
    title: str = Field(None, description="Task title")
    description: str = Field(None, description="Task description")
    position: int = Field(None, description="Task position in list")
    created_at: str = Field(None, description="Date when the task was created")
    updated_at: str = Field(None, description="Date of the last time the task was updated")
    owner_id: str = Field(None, description="Task owner information")

    def __init__(
            self
            , task_id: str
            , title: str
            , description: str
            , position: int
            , created_at: str
            , updated_at: str
            , owner_id: str):
        super().__init__()

        self.id = task_id
        self.title = title
        self.description = description
        # TODO: Stops being optional after the apps catch up to this.
        self.position = position or 0
        self.created_at = created_at
        self.updated_at = updated_at
        self.owner_id = owner_id

    def to_dto(self):
        return TaskDTO(
            uuid.UUID(self.id)
            , self.title
            , self.description
            , self.position
            , parser.parse(self.created_at)
            , parser.parse(self.updated_at)
            , uuid.UUID(self.owner_id))


class CreateTasksRequest(BaseModel):
    tasks: list[CreateTaskRequest] = Field(None, description="List of tasks")

    def __init__(self, tasks):
        super().__init__()

        task_entries = []
        for task in tasks:
            task_entries \
                .append(
                    CreateTaskRequest(
                        task["task_id"]
                        , task["title"]
                        , task.get("description", "")
                        , task.get("position", 0) # TODO: After apps are migrated this should become mandatory
                        , task["created_at"]
                        , task["updated_at"]
                        , task["owner_id"]
                    ))
        self.tasks = task_entries

    def to_dto(self):
        return [task.to_dto() for task in self.tasks]


class CreateTasksResponse(BaseModel):
    ids: list[str] = Field(None, description="Ids of the tasks that were created")

    def __init__(self, tasks: list[uuid]):
        super().__init__()
        self.ids = [str(task_id) for task_id in tasks]


class UpdateTaskRequest(BaseModel):
    id: str = Field(None, description="Task id")
    title: str = Field(None, description="Task title")
    description: str = Field(None, description="Task description")
    position: int = Field(None, description="Task position in list")
    updated_at: str = Field(None, description="Last time the task was updated")

    def __init__(
            self
            , task_id: str
            , title: str
            , description: str
            , position: int
            , updated_at: str):
        super().__init__()

        self.id = task_id
        self.title = title
        self.description = description
        self.position = position
        self.updated_at = updated_at

    def to_dto(self):
        return TaskDTO(
            uuid.UUID(self.id)
            , self.title
            , self.description
            , self.position
            , None
            , parser.parse(self.updated_at)
            , None
        )


class UpdateTasksRequest(BaseModel):
    tasks: list[UpdateTaskRequest] = Field(None, description="List of tasks to update")

    def __init__(self, tasks):
        super().__init__()

        task_entries = []
        for task in tasks:
            task_entries \
                .append(UpdateTaskRequest(
                    task["task_id"]
                    , task["title"]
                    , task.get("description", "")
                    , task.get("position", 0) # TODO: Should be changed after apps catch up
                    , task["updated_at"]))
        self.tasks = task_entries

    def to_dto(self):
        return [task.to_dto() for task in self.tasks]


class TaskResponse(BaseModel):
    task_id: str = Field(None, description="Task id")
    title: str = Field(None, description="Task title")
    description: str = Field(None, description="Task description")
    position: int = Field(None, description="Task position in list")
    owner_id: str = Field(None, description="Tasks owner id")

    def __init__(self, task: TaskDTO):
        super().__init__()

        self.task_id = task.id
        self.title = task.title
        self.description = task.description
        self.position = task.position
        self.owner_id = task.owner_id


class ListTasksResponse(BaseModel):
    tasks: list[TaskResponse] = Field(None, description="List of task to be returned")

    def __init__(self, tasks: list[TaskDTO]):
        super().__init__()
        self.tasks = [TaskResponse(task) for task in tasks]