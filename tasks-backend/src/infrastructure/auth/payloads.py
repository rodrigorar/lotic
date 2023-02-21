from src.application.auth import AuthToken, Principal


class LoginRequest:

    def __init__(self, subject: str, secret: str):
        self.subject = subject
        self.secret = secret

    def to_dto(self):
        return Principal(self.subject, self.secret)


class AuthTokenResponse:

    def __init__(self, token: str, refresh_token: str, account_id: str, expires_at: str):
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
