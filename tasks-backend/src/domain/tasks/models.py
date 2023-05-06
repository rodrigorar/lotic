import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from src.domain import DatabaseProvider
from src.domain.accounts import Account

db = DatabaseProvider().get()


class Task(db.Model):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    owner_id = Column(String, nullable=False)

    def __init__(
            self,
            task_id: uuid,
            title: str,
            description: str,
            created_at: datetime,
            updated_at: datetime,
            owner_id: uuid):

        self.id = str(task_id)
        self.title = title
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at
        self.owner_id = str(owner_id) if owner_id is not None else None

    def get_id(self):
        return uuid.UUID(self.id)

    def get_owner_id(self):
        return uuid.UUID(self.owner_id) if self.owner_id is not None else None

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

        return cls(task_id, title, description, created_at, updated_at, owner_id)


class AccountTasks(db.Model):
    __tablename__ = "account_tasks"

    id = Column(Integer, primary_key=True)
    account_id = Column(String, ForeignKey(Account.id))
    task_id = Column(String, ForeignKey(Task.id))

    def __init__(self, account_id: uuid, task_id: uuid):
        self.account_id = str(account_id)
        self.task_id = str(task_id)

    def get_account_id(self):
        return uuid.UUID(self.account_id) if self.account_id is not None else None

    def get_task_id(self):
        return uuid.UUID(self.task_id) if self.task_id is not None else None

    @classmethod
    def from_values(cls, account_id: uuid, task_id: uuid):
        assert account_id is not None, "User Id cannot be empty."
        assert task_id is not None, "Task Id cannot be empty."
        return cls(account_id, task_id)
