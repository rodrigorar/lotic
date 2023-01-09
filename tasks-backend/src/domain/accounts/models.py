import uuid
from datetime import datetime

from src.domain import DatabaseProvider

db = DatabaseProvider().get()


class Account(db.Model):
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.String, nullable=False)

    def __init__(self, account_id: uuid, email: str, password: str, created_at: datetime, updated_at: datetime):
        self.id = str(account_id)
        self.email = email
        self.password = password
        self.created_at = created_at
        self.updated_at = updated_at

    def get_id(self):
        return uuid.UUID(self.id)

    @classmethod
    def from_values(cls, account_id, email, password, created_at, updated_at):
        assert account_id is not None, "Account id cannot be empty."
        assert email is not None, "Email cannot be empty."
        assert password is not None, "Password cannot be empty"
        assert created_at is not None, "Created At cannot be empty."
        assert updated_at is not None, "Updated At cannot be empty."
        return cls(account_id, email, password, created_at, updated_at)
