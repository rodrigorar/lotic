from datetime import datetime
import uuid

from pydantic import BaseModel, Field

from src.application.accounts import AccountDTO


class CreateAccountRequest(BaseModel):
    email: str = Field(None, description="Account email")
    password: str = Field(None, description="Account password")
    language: str = Field(None, description="Language")

    def __init__(self, email: str, password: str, language: str):
        super().__init__()

        self.email = email
        self.password = password
        self.language = language or 'en'

    def to_dto(self):
        return AccountDTO(
            uuid.uuid4()
            , self.email
            , self.password
            , self.language
            , datetime.now()
            , datetime.now())


class UpdateAccountRequest(BaseModel):
    password: str = Field(None, description="Account password")
    language: str = Field(None, description="Language")

    def __init__(self, password: str, language: str):
        super().__init__()

        self.password = password
        self.language = language

    def to_dto(self, account_id: uuid):
        return AccountDTO(account_id, None, self.password, self.language, None, datetime.now())


class CreateAccountResponse(BaseModel):
    id: str = Field(None, description="The id of the created account")

    def __init__(self, account_id: uuid):
        super().__init__()

        self.id = str(account_id)


class GetAccountResponse(BaseModel):
    id: str = Field(None, description="Id of the Account")
    email: str = Field(None, description="Account email")
    language: str = Field(None, description="Language")
    created_at: str = Field(None, description="When this account was created")
    updated_at: str = Field(None, description="The last time this account was updated")

    def __init__(self, account_id: uuid, email: str, language: str, created_at: datetime, updated_at: datetime):
        super().__init__()

        self.id = str(account_id)
        self.email = email
        self.language = language
        self.created_at = created_at.astimezone().isoformat()
        self.updated_at = updated_at.astimezone().isoformat()

    @classmethod
    def from_dto(cls, dto: AccountDTO):
        return cls(dto.id, dto.email, dto.language, dto.created_at, dto.updated_at) \
            if dto is not None \
            else cls(None, None, None, None)
