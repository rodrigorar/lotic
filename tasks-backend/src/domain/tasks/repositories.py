import uuid
from typing import Optional

from src.domain import BaseRepository
from src.domain.tasks import Task, AccountTasks


class TasksRepository(BaseRepository):

    def get_by_id(self, unit_of_work, entity_id: uuid) -> Optional[Task]:
        raise NotImplemented("TasksRepository#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity: Task):
        raise NotImplemented("TasksRepository#insert is not implemented.")

    def insert_multiple(self, unit_of_work, entities: list[Task]):
        raise NotImplemented("TasksRepository#insert_multiple is not implemented.")

    def update(self, unit_of_work, entity: Task):
        raise NotImplemented("TasksRepository#update is not implemented.")

    def update_multiple(self, unit_of_work, entities: list[Task]):
        raise NotImplemented("TasksRepository#update_multiple is not implemented")

    def delete(self, unit_of_work, entity_id: uuid):
        raise NotImplemented("TasksRepository#delete is not implemented.")

    def delete_multiple(self, unit_of_work, entity_ids: list[uuid]):
        raise NotImplemented("TasksRepository#delete_multiple is not implemented.")


class UserTasksRepository(BaseRepository):

    def insert(self, unit_of_work, entity: AccountTasks):
        raise NotImplemented("UserTasksRepository#insert is not implemented.")

    def insert_multiple(self, unit_of_work, entities: list[AccountTasks]):
        raise NotImplemented("UserTasksRepository#insert_multiple not implemented.")

    def list(self, unit_of_work, user_id: uuid) -> list[AccountTasks]:
        raise NotImplemented("UserTasksRepository#list_tasks is not implemented.")

    def delete_by_task_id(self, unit_of_work, task_id: uuid):
        raise NotImplemented("UserTasksRepository#delete_by_task_id is not implemented.")
