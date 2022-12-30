import uuid
from datetime import datetime

from src.domain import DatabaseProvider

db = DatabaseProvider().get()


class User(db.Model):
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.String, nullable=False)

    def __init__(self, user_id: uuid, email: str, created_at: datetime, updated_at: datetime):
        self.id = user_id
        self.email = email
        self.created_at = created_at
        self.updated_at = updated_at

    @classmethod
    def from_values(cls, user_id, email, created_at, updated_at):
        assert user_id is not None, "User Id cannot be empty."
        assert email is not None, "Email cannot be empty."
        assert created_at is not None, "Created At cannot be empty."
        assert updated_at is not None, "Updated At cannot be empty."
        return cls(user_id, email, created_at, updated_at)
