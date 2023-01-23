from datetime import datetime
import uuid
from uuid import uuid4

from src.application.accounts import AccountDTO


class CreateAccountRequest:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

    def to_dto(self):
        return AccountDTO(uuid4(), self.email, self.password, datetime.now(), datetime.now())


class GetAccountResponse:

    def __init__(self, account_id: uuid, email: str, created_at: datetime, updated_at: datetime):
        self.id = account_id
        self.email = email
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_dto(cls, dto: AccountDTO):
        return cls(dto.id, dto.email, dto.created_at, dto.updated_at) \
            if dto is not None \
            else cls(None, None, None, None)
