import uuid
from datetime import datetime

from src.application import DTOTranslator
from src.domain.tasks import Task, AccountTasks


class TaskDTO(DTOTranslator):

    def __init__(
            self,
            task_id: uuid,
            title: str,
            description: str,
            created_at: datetime,
            updated_at: datetime,
            owner_id: uuid):

        self.id = task_id
        self.title = title
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at
        self.owner_id = owner_id

    def to_entity(self):
        return Task.from_values(
            self.id
            , self.title
            , self.description
            , self.created_at
            , self.updated_at
            , self.owner_id)

    @classmethod
    def from_entity(cls, entity):
        return cls(
            uuid.UUID(entity.id)
            , entity.title
            , entity.description
            , entity.created_at
            , entity.updated_at
            , entity.owner_id)


class UserTasksDTO(DTOTranslator):

    def __init__(self, user_id: uuid, task_id: uuid):
        self.user_id = user_id
        self.task_id = task_id

    def to_entity(self):
        return AccountTasks.fromValues(self.user_id, self.task_id)

    @classmethod
    def from_entity(cls, entity):
        return cls(entity.user_id, entity.task_id)

