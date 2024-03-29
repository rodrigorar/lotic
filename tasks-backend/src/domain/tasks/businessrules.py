from logging import Logger
import uuid

from src.domain import BaseBusinessRule
from src.domain.tasks import AccountTasks, Task, TasksRepository, AccountTasksRepository


class CreateTasks(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , tasks_repository: TasksRepository
            , user_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = user_tasks_repository

    def execute(self, tasks: list[Task]) -> list[uuid]:
        self.logger.info("Executing ---> BusinessRule[CreateTasks]")

        assert tasks is not None, "Task list cannot be null"

        account_tasks = [AccountTasks(task.get_owner_id(), task.get_id()) for task in tasks]
        self.tasks_repository.insert_multiple(self.unit_of_work, tasks)
        self.account_tasks_repository.insert_multiple(self.unit_of_work, account_tasks)

        return [task.get_id() for task in tasks]


class UpdateTasks(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , tasks_repository: TasksRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.tasks_repository = tasks_repository

    def execute(self, tasks: list[Task]):
        self.logger.info("Executing ---> BusinessRule[UpdateTasks]")

        assert tasks is not None, "Tasks cannot be null"
        self.tasks_repository.update_multiple(self.unit_of_work, tasks)


class DeleteTasks(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , tasks_repository: TasksRepository
            , account_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = account_tasks_repository

    def execute(self, task_ids: list[uuid]):
        self.logger.info("Executing ---> BusinessRule[DeleteTasks]")

        assert task_ids is not None, "Task Ids cannot be null"

        self.tasks_repository.delete_multiple(self.unit_of_work, task_ids)
        self.account_tasks_repository.delete_multiple_by_task_id(self.unit_of_work, task_ids)


class ListTasks(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , tasks_repository: TasksRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.tasks_repository = tasks_repository

    def execute(self, tasks_ids: list[uuid]):
        self.logger.info("Executing ---> BusinessRule[ListTasks]")

        assert tasks_ids is not None

        return self.tasks_repository.list_tasks(self.unit_of_work, tasks_ids)


class ListTasksForAccount(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , tasks_repository: TasksRepository
            , account_tasks_repository: AccountTasksRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.tasks_repository = tasks_repository
        self.account_tasks_repository = account_tasks_repository

    def execute(self, account_id: uuid):
        self.logger.info("Executing ---> BusinessRule[ListTasksForAccount]")

        assert account_id is not None, "Account id cannot be null"

        account_tasks = self.account_tasks_repository \
            .list_account_tasks(self.unit_of_work, account_id)
        result = self.tasks_repository \
            .list_tasks(self.unit_of_work, [account_task.get_task_id() for account_task in account_tasks])
        return result if result is not None else []


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
    def list_tasks(unit_of_work) -> ListTasks:
        raise NotImplementedError("TasksBusinessRulesProvider#list_tasks is not implemented")

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForAccount:
        raise NotImplemented("TasksBusinessRulesProvider#list_tasks_for_user is not implemented.")
