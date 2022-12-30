import uuid
from datetime import datetime

from src.domain import DatabaseProvider
from src.domain.users.models import User

db = DatabaseProvider().get()


class Task(db.Model):
    __tablename__ = "task"

    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.String, nullable=False)
    owner_id = db.Column(db.String, nullable=False)

    def __init__(self, task_id, title, description, created_at, updated_at, owner_id):
        self.id = task_id
        self.title = title
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at
        self.owner_id = owner_id

    @classmethod
    def from_values(
            cls,
            task_id: uuid,
            title: str,
            description: str,
            created_at: datetime,
            updated_at: datetime,
            owner_id: uuid):

        assert task_id is not None, "Task Id cannot be empty"
        assert created_at is not None, "Created At cannot be empty"
        assert updated_at is not None, "Updated At cannot be empty"
        assert owner_id is not None, "Owner Id cannot be empty"

        return cls(task_id, title, description, created_at, updated_at, owner_id)


class UserTasks(db.Model):
    __tablename__ = "user_tasks"

    user_id: db.Column("user_id", db.String, db.ForeignKey(User.id), nullable=False)
    task_id: db.Column("task_id", db.String, db.ForeignKey(Task.id), nullable=False)

    def __init__(self, user_id, task_id):
        self.user_id = user_id
        self.task_id = task_id

    @classmethod
    def from_values(cls, user_id, task_id):
        assert user_id is not None, "User Id cannot be empty."
        assert task_id is not None, "Task Id cannot be empty."
        return cls(user_id, task_id)
