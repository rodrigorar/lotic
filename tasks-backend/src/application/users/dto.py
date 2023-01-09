import uuid
from datetime import datetime

from src.application import DTOTranslator
from src.domain.accounts import User


class UserDTO(DTOTranslator):

    def __init__(self, user_id: uuid, email: str, password: str, created_at: datetime, updated_at: datetime):
        self.id = user_id
        self.email = email
        self.password = password
        self.created_at = created_at
        self.updated_at = updated_at

    def to_entity(self):
        return User.from_values(self.id, self.email, self.password, self.created_at, self.updated_at)

    def equals(self, other):
        return self.id == other.id \
            and self.email == other.email \
            and self.created_at == other.created_at

    @classmethod
    def from_entity(cls, entity):
        assert entity is not None, "Entity cannot be empty"
        assert entity.id is not None, "Id cannot be empty"
        assert entity.email is not None, "Email cannot be empty"
        assert entity.created_at is not None, "Created at cannot be empty"
        assert entity.updated_at is not None, "Updated at cannot be empty"

        return cls(entity.id, entity.email, entity.password, entity.created_at, entity.updated_at)
