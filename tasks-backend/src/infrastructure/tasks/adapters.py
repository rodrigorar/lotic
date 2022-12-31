import uuid
from typing import Optional

from src.domain.tasks import TasksRepository, Task, UserTasksRepository, UserTasks, TasksBusinessRulesProvider, \
    ListTasksForUser, DeleteTasks, UpdateTasks, CreateTasks


class TasksRepositoryImpl(TasksRepository):

    def get_by_id(self, unit_of_work, entity_id: uuid) -> Optional[Task]:
        raise NotImplementedError("TasksRepositoryImpl#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity: Task):
        raise NotImplementedError("TasksRepositoryImpl#insert is not implemented.")

    def insert_multiple(self, unit_of_work, entities: list[Task]):
        raise NotImplementedError("TasksRepositoryImpl#insert_multiple is not implemented.")

    def update(self, unit_of_work, entity: Task):
        raise NotImplementedError("TasksRepositoryImpl#update is not implemented.")

    def update_multiple(self, unit_of_work, entities: list[Task]):
        raise NotImplementedError("TasksRepositoryImpl#update_multiple is not implemented.")

    def delete(self, unit_of_work, entity_id: uuid):
        raise NotImplementedError("TasksRepositoryImpl#delete is not implemented.")

    def delete_multiple(self, unit_of_work, entity_ids: list[uuid]):
        raise NotImplementedError("TasksRepositoryImpl#delete_multiple is not implemented.")


class UserTasksRepositoryImpl(UserTasksRepository):

    def insert(self, unit_of_work, entity: UserTasks):
        raise NotImplementedError("UserTasksRepositoryImpl#insert is not implemented.")

    def insert_multiple(self, unit_of_work, entity: list[UserTasks]):
        raise NotImplementedError("UserTasksRepositoryImpl#insert_multiple is not implemented.")

    def list(self, unit_of_work, user_id: uuid) -> list[UserTasks]:
        raise NotImplementedError("UserTasksRepositoryImpl#list is not implemented.")

    def delete_by_task_id(self, unit_of_work, task_id: uuid):
        raise NotImplementedError("UserTasksRepositoryImpl#delete_by_task_id is not implemented.")


class TasksBusinessRulesProviderImpl(TasksBusinessRulesProvider):

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        raise NotImplementedError("TasksBusinessRulesProviderImpl#create_tasks is not implemented.")

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        raise NotImplementedError("TasksBusinessRulesProviderImpl#update_tasks is not implemented.")

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        raise NotImplementedError("TasksBusinessRulesProviderImpl#delete_tasks is not implemented.")

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForUser:
        raise NotImplementedError("TasksBusinessRulesProviderImpl#list_tasks_for_user is not implemented.")


class TasksUseCaseProvider:

    @staticmethod
    def create_task():
        raise NotImplemented("TasksUseCaseProvider#create_task is not implemented.")

    @staticmethod
    def update_tasks():
        raise NotImplemented("TasksUseCaseProvider#update_task is not implemented.")

    @staticmethod
    def delete_tasks():
        raise NotImplemented("TasksUseCaseProvider#delete_task is not implemented.")

    @staticmethod
    def list_tasks_for_user():
        raise NotImplemented("TasksUseCaseProvider#list_tasks_for_user is not implemented.")