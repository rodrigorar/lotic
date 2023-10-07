import uuid
from datetime import datetime

from src.application import DTOTranslator
from src.domain.tasks import Task


class TaskDTO(DTOTranslator):

    def __init__(
            self
            , task_id: uuid
            , title: str
            , description: str
            , position: int
            , created_at: datetime
            , updated_at: datetime
            , owner_id: uuid):

        self.id = str(task_id)
        self.title = title
        self.description = description
        self.position = position
        self.created_at = created_at
        self.updated_at = updated_at
        self.owner_id = str(owner_id) if owner_id is not None else None

    def get_id(self):
        return uuid.UUID(self.id)

    def get_owner_id(self):
        return uuid.UUID(self.owner_id) if self.owner_id is not None else None

    def to_entity(self):
        return Task.from_values(
            self.get_id()
            , self.title
            , self.description
            , self.position
            , self.created_at
            , self.updated_at
            , self.get_owner_id())

    @classmethod
    def from_entity(cls, entity):
        return cls(
            uuid.UUID(entity.id)
            , entity.title
            , entity.description
            , entity.position
            , entity.created_at
            , entity.updated_at
            , entity.owner_id)

