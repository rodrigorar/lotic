from functools import reduce
from typing import List
import uuid

from src.domain import BaseBusinessRule, reducer_duplicated
from src.domain.tasks import AccountTasks, Task, TasksRepository, AccountTasksRepository


class CreateTasks(BaseBusinessRule):
    __tasks_repository = None
    __account_tasks_repository = None

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , user_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__account_tasks_repository = user_tasks_repository

    def execute(self, tasks: list[Task]) -> list[uuid]:
        assert tasks is not None, "Task list cannot be null"
        owner_ids = reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
        assert len(owner_ids) == 1, "Cannot create tasks for more than one owner at a time"

        task_ids = self.__tasks_repository.insert_multiple(self.unit_of_work, tasks)
        account_tasks = [AccountTasks(owner_ids, task_id) for task_id in task_ids]
        self.__account_tasks_repository.insert_multiple(self.unit_of_work, account_tasks)

        return task_ids


class UpdateTasks(BaseBusinessRule):
    __tasks_repository = None

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository):

        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository

    def execute(self, tasks: list[Task]):
        assert tasks is not None, "Tasks cannot be null"
        owner_ids = reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
        assert len(owner_ids) == 1, "Cannot create tasks for more than one owner at a time"

        result = self.__tasks_repository.update_multiple(self.unit_of_work, tasks)
        return result


class DeleteTasks(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , user_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port: list[uuid]):
        raise NotImplemented("DeleteTasks#execute is not implemented.")


class ListTasksForUser(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , user_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port):
        raise NotImplemented("ListTasksForUser#execute is not implemented.")


class TasksBusinessRulesProvider:

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        raise NotImplemented("TasksBusinessRulesProvider#create_tasks is not implemented.")

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        raise NotImplemented("TasksBusinessRulesProvider#update_tasks is not implemented.")

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        raise NotImplemented("TasksBusinessRulesProvider#delete_tasks is not implemented.")

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForUser:
        raise NotImplemented("TasksBusinessRulesProvider#list_tasks_for_user is not implemented.")
