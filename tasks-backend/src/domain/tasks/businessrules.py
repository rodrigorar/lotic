import uuid

from src.domain import BaseBusinessRule
from src.domain.tasks import Task, TasksRepository, AccountTasksRepository


class CreateTasks(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(self, unit_of_work, tasks_repository: TasksRepository, user_tasks_repository: AccountTasksRepository):
        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port: list[Task]) -> list[uuid]:
        raise NotImplemented("CreateTask#execute is not implemented.")


class UpdateTasks(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(self, unit_of_work, tasks_repository: TasksRepository, user_tasks_repository: AccountTasksRepository):
        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port: list[Task]):
        raise NotImplemented("UpdateTasks#execute is not implemented.")


class DeleteTasks(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(self, unit_of_work, tasks_repository: TasksRepository, user_tasks_repository: AccountTasksRepository):
        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port: list[uuid]):
        raise NotImplemented("DeleteTasks#execute is not implemented.")


class ListTasksForUser(BaseBusinessRule):
    __tasks_repository = None
    __user_tasks_repository = None

    def __init__(self, unit_of_work, tasks_repository: TasksRepository, user_tasks_repository: AccountTasksRepository):
        super().__init__(unit_of_work)
        self.__tasks_repository = tasks_repository
        self.__user_tasks_repository = user_tasks_repository

    def execute(self, port):
        raise NotImplemented("ListTasksForUser#execute is not implemented.")


class TasksBusinessRulesProvider:

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        raise NotImplemented("TasksBusinessRulesPovider#create_tasks is not implemented.")

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        raise NotImplemented("TasksBusinessRulesProvider#update_tasks is not implemented.")

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        raise NotImplemented("TasksBusinessRulesProvider#delete_tasks is not implemented.")

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForUser:
        raise NotImplemented("TasksBusinessRulesProvider#list_tasks_for_user is not implemented.")
