import uuid
from pydantic import BaseModel, Field

from src.application.auth import AuthToken, Principal


class LoginRequest(BaseModel):
    subject: str = Field(None, description="Authentication Subject")
    secret: str = Field(None, description="Authentication Secret")

    def __init__(self, subject: str, secret: str):
        super().__init__()

        self.subject = subject
        self.secret = secret

    def to_dto(self):
        return Principal(self.subject, self.secret)


class LogoutRequest(BaseModel):
    account_id: str = Field(None, description="Account id to logout")

    def __init__(self, account_id: str):
        super().__init__()

        self.account_id = account_id

    def to_dto(self):
        return uuid.UUID(self.account_id)


class AuthTokenResponse(BaseModel):
    token: str = Field(None, description="Authentication access token")
    refresh_token: str = Field(None, description="Authentication refresh token")
    account_id: str = Field(None, description="Account id associated to this tokens")
    expires_at: str = Field(None, description="When this access token will expires")

    def __init__(self, token: str, refresh_token: str, account_id: str, expires_at: str):
        super().__init__()

        self.token = token
        self.refresh_token = refresh_token
        self.account_id = account_id
        self.expires_at = expires_at

    @classmethod
    def from_dto(cls, dto: AuthToken):
        return cls(
            dto.token
            , dto.refresh_token
            , str(dto.account_id)
            , dto.expires_at.astimezone().isoformat())
