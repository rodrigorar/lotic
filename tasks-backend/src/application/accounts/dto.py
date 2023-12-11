import uuid
from datetime import datetime

from dateutil import parser

from src.application import DTOTranslator
from src.domain.accounts import Account


class AccountDTO(DTOTranslator):

    def __init__(
            self
            , account_id: uuid
            , email: str
            , password: str
            , language: str
            , created_at: datetime
            , updated_at: datetime):

        self.id = account_id
        self.email = email
        self.password = password
        self.language = language
        self.created_at = created_at
        self.updated_at = updated_at

    def to_entity(self):
        return Account.from_values(
            self.id
            , self.email
            , self.password
            , self.language
            , self.created_at
            , self.updated_at)

    def equals(self, other):
        return self.id == other.id \
            and self.email == other.email \
            and self.created_at == other.created_at

    @classmethod
    def from_entity(cls, entity):
        assert entity is not None, "Entity cannot be empty"
        assert entity.id is not None, "Id cannot be empty"
        assert entity.email is not None, "Email cannot be empty"
        assert entity.language is not None, "Language cannot be empty"
        assert entity.created_at is not None, "Created at cannot be empty"
        assert entity.updated_at is not None, "Updated at cannot be empty"

        return cls(
            uuid.UUID(entity.id)
            , entity.email
            , entity.password
            , entity.language
            , parser.parse(entity.created_at)
            , parser.parse(entity.updated_at))
