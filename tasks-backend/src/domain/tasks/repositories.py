from datetime import datetime
import uuid

from src.domain import BaseRepository
from src.domain.tasks import Task, AccountTasks


class TasksRepository(BaseRepository):

    def insert_multiple(self, unit_of_work, tasks: list[Task]):
        raise NotImplementedError("TasksRepository#insert_multiple")

    def update_multiple(self, unit_of_work, tasks: list[Task]):
        raise NotImplementedError("TasksRepository#update_multiple")

    def delete_multiple(self, unit_of_work, task_ids: list[uuid]):
        raise NotImplementedError("TasksRepository#delete_multiple")


class AccountTasksRepository(BaseRepository):

    def insert_multiple(self, unit_of_work, account_tasks: list[AccountTasks]):
        raise NotImplemented("AccountTasksRepository#insert_multiple not implemented.")

    def list(self, unit_of_work, account_id: uuid):
        raise NotImplemented("AccountTasksRepository#list is not implemented")

    def delete_by_task_id(self, unit_of_work, task_id: uuid):
        raise NotImplemented("AccountTasksRepository#delete_by_task_id is not implemented.")
