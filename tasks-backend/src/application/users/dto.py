import uuid
from datetime import datetime

from src.application import DTOTranslator
from src.domain.users import User


class UserDTO(DTOTranslator):

    def __init__(self, user_id: uuid, email: str, password: str, created_at: datetime, updated_at: datetime):
        self.id = user_id
        self.email = email
        self.password = password
        self.created_at = created_at
        self.updated_at = updated_at

    def to_entity(self):
        return User.from_values(self.id, self.email, self.password, self.created_at, self.updated_at)

    @classmethod
    def from_entity(cls, entity):
        return cls(entity.id, entity.email, entity.password, entity.created_at, entity.updated_at)
