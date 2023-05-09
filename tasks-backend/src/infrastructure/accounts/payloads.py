from datetime import datetime
import uuid
from uuid import uuid4

from pydantic import BaseModel, Field

from src.application.accounts import AccountDTO


class CreateAccountRequest(BaseModel):
    email: str = Field(None, description="Account email")
    password: str = Field(None, description="Account password")

    def __init__(self, email: str, password: str):
        super().__init__()

        self.email = email
        self.password = password

    def to_dto(self):
        return AccountDTO(uuid4(), self.email, self.password, datetime.now(), datetime.now())


class CreateAccountResponse(BaseModel):
    id: str = Field(None, description="The id of the created account")

    def __init__(self, account_id: uuid):
        super().__init__()

        self.id = str(account_id)


class GetAccountResponse(BaseModel):
    id: str = Field(None, description="Id of the Account")
    email: str = Field(None, description="Account email")
    created_at: str = Field(None, description="When this account was created")
    updated_at: str = Field(None, description="The last time this account was updated")

    def __init__(self, account_id: uuid, email: str, created_at: datetime, updated_at: datetime):
        super().__init__()

        self.id = str(account_id)
        self.email = email
        self.created_at = created_at.astimezone().isoformat()
        self.updated_at = updated_at.astimezone().isoformat()

    @classmethod
    def from_dto(cls, dto: AccountDTO):
        return cls(dto.id, dto.email, dto.created_at, dto.updated_at) \
            if dto is not None \
            else cls(None, None, None, None)
