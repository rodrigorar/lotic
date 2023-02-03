import uuid

from dateutil import parser

from src.application.tasks import TaskDTO


class CreateTaskRequest:

    def __init__(
            self
            , task_id: str
            , title: str
            , description: str
            , created_at: str
            , updated_at: str
            , owner_id: str):

        self.id = uuid.UUID(task_id)
        self.title = title
        self.description = description
        self.created_at = parser.parse(created_at)
        self.updated_at = parser.parse(updated_at)
        self.owner_id = uuid.UUID(owner_id)

    def to_dto(self):
        return TaskDTO(
            self.id
            , self.title
            , self.description
            , self.created_at
            , self.updated_at
            , self.owner_id)


class CreateTasksRequest:

    def __init__(self, tasks):
        task_entries = []
        for task in tasks:
            task_entries \
                .append(
                    CreateTaskRequest(
                        task["task_id"]
                        , task["title"]
                        , task["description"]
                        , task["created_at"]
                        , task["updated_at"]
                        , task["owner_id"]
                    ))
        self.tasks = task_entries

    def to_dto(self):
        return [task.to_dto() for task in self.tasks]
