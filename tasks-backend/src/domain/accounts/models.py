import uuid
from datetime import datetime

from sqlalchemy import Column, String

from src.domain import DatabaseProvider

db = DatabaseProvider().get()


class Account(db.Model):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    language = Column(String, nullable=False, server_default='en')
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    def __init__(
            self
            , account_id: uuid
            , email: str
            , password: str
            , language: str
            , created_at: datetime
            , updated_at: datetime):

        self.id = str(account_id)
        self.email = email
        self.password = password
        self.language = language
        self.created_at = created_at.astimezone().isoformat() if created_at else None
        self.updated_at = updated_at.astimezone().isoformat() if updated_at else None

    def get_id(self):
        return uuid.UUID(self.id)

    @classmethod
    def from_values(cls, account_id, email, password, language, created_at, updated_at):
        assert account_id is not None, "Account id cannot be empty."
        return cls(account_id, email, password, language, created_at, updated_at)
