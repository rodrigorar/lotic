from functools import reduce
from typing import List
import uuid

from src.domain import BaseBusinessRule, reducer_duplicated
from src.domain.errors import InternalError
from src.domain.tasks import AccountTasks, Task, TasksRepository, AccountTasksRepository


class CreateTasks(BaseBusinessRule):

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , user_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = user_tasks_repository

    def execute(self, tasks: list[Task]) -> list[uuid]:
        assert tasks is not None, "Task list cannot be null"
        owner_ids = reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
        assert len(owner_ids) == 1, "Cannot create tasks for more than one owner at a time"

        task_ids = self.tasks_repository.insert_multiple(self.unit_of_work, tasks)
        account_tasks = [AccountTasks(owner_ids, task_id) for task_id in task_ids]
        self.account_tasks_repository.insert_multiple(self.unit_of_work, account_tasks)

        return task_ids


class UpdateTasks(BaseBusinessRule):

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository):

        super().__init__(unit_of_work)
        self.tasks_repository = tasks_repository

    def execute(self, tasks: list[Task]):
        assert tasks is not None, "Tasks cannot be null"
        owner_ids = reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
        assert len(owner_ids) == 1, "Cannot create tasks for more than one owner at a time"

        result = self.tasks_repository.update_multiple(self.unit_of_work, tasks)
        return result


class DeleteTasks(BaseBusinessRule):

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , account_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = account_tasks_repository

    def execute(self, task_ids: list[uuid]):
        assert task_ids is not None, "Task Ids cannot be null"

        self.tasks_repository.delete_multiple(self.unit_of_work, task_ids)
        for task_id in task_ids:
            self.account_tasks_repository.delete_by_task_id(self.unit_of_work, task_id)


class ListTasksForAccount(BaseBusinessRule):

    def __init__(
            self
            , unit_of_work
            , tasks_repository: TasksRepository
            , account_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = account_tasks_repository

    def execute(self, account_id: uuid):
        assert account_id is not None, "Account id cannot be null"

        result = []

        account_tasks = self.account_tasks_repository.list(self.unit_of_work, account_id)
        # TODO: Optimize this code so that we don't have this loop
        for account_task in account_tasks:
            task = self.tasks_repository.get_by_id(self.unit_of_work, account_task.get_task_id())
            if task is None:
                raise InternalError("Invalid data state, cannot recover")
            result.append(task)

        return result


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
    def list_tasks_for_user(unit_of_work) -> ListTasksForAccount:
        raise NotImplemented("TasksBusinessRulesProvider#list_tasks_for_user is not implemented.")
