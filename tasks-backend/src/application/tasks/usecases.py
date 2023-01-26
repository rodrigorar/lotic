from src.application import UnitOfWorkProvider, UseCase
from src.domain.tasks import TasksBusinessRulesProvider


class UseCaseCreateTasks(UseCase):
    __unit_of_work_provider = None
    __task_br_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseCreateTask#execute is not implemented.")


class UseCaseUpdateTasks(UseCase):
    __unit_of_work_provider = None
    __task_br_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseUpdateTasks#execute is not implemented.")


class UseCaseDeleteTasks(UseCase):
    __unit_of_work_provider = None
    __task_br_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseDeleteTasks#execute is not implemented.")


class UseCaseListTasksForUser(UseCase):
    __unit_of_work_provider = None
    __task_br_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseListTasksForUser#execute is not implemented.")
