from datetime import datetime
import uuid

from src.domain import DatabaseProvider
from src.domain.accounts import Account

db = DatabaseProvider().get()


class Principal:

    def __init__(self, subject: str, secret: str):
        self.subject = subject
        self.secret = secret


class AuthToken:

    def __init__(
            self
            , token: str
            , refresh_token: str
            , account_id: uuid
            , expires_at: datetime):
        self.token = token
        self.refresh_token = refresh_token
        self.account_id = account_id
        self.expires_at = expires_at


class AuthSession(db.Model):
    __tablename__ = "auth_sessions"

    id = db.Column(db.String, primary_key=True)
    refresh_token = db.Column(db.String, nullable=False)
    account_id = db.Column(db.String, db.ForeignKey(Account.id))
    created_at = db.Column(db.DateTime, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    refresh_expires_at = db.Column(db.DateTime, nullable=False)

    def __init__(
            self
            , session_id: uuid
            , refresh_token: str
            , account_id: uuid
            , created_at: datetime
            , expires_at: datetime
            , refresh_expires_at: datetime):

        self.id = str(session_id)
        self.refresh_token = refresh_token
        self.account_id = str(account_id)
        self.created_at = created_at
        self.expires_at = expires_at
        self.refresh_expires_at = refresh_expires_at

    def get_id(self):
        return uuid.UUID(self.id)

    def get_account_id(self):
        return uuid.UUID(self.account_id)

    def is_valid(self):
        return self.expires_at > datetime.now()

    def is_refresh_expired(self):
        return self.refresh_expires_at < datetime.now()
