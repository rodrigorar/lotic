import uuid

from src.application import UnitOfWorkProvider, UseCase
from src.application.tasks import TaskDTO
from src.domain.tasks import TasksBusinessRulesProvider


class UseCaseCreateTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, tasks: list[TaskDTO]) -> list[uuid]:
        assert tasks is not None, "No task were provided"

        with self.unit_of_work_provider.get() as unit_of_work:
            create_tasks_br = self.tasks_br_provider.create_tasks(unit_of_work)
            result = create_tasks_br.execute([task.to_entity() for task in tasks])

        return result



class UseCaseUpdateTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseUpdateTasks#execute is not implemented.")


class UseCaseDeleteTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseDeleteTasks#execute is not implemented.")


class UseCaseListTasksForUser(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, port):
        raise NotImplemented("UseCaseListTasksForUser#execute is not implemented.")
