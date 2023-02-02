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

    def execute(self, tasks: list[TaskDTO]):
        assert tasks is not None, "Tasks cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            update_tasks_br = self.tasks_br_provider.update_tasks(unit_of_work)
            result = update_tasks_br.execute([task.to_entity() for task in tasks])

        return result


class UseCaseDeleteTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, task_ids: list[uuid]):
        assert task_ids is not None, "Task id list cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            delete_task = self.tasks_br_provider.delete_tasks(unit_of_work)
            delete_task.execute(task_ids)


class UseCaseListTasksForUser(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, account_id: uuid):
        assert account_id is not None, "Account id cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            list_account_tasks = self.tasks_br_provider.list_tasks_for_user(unit_of_work)
            result = list_account_tasks.execute(account_id)

        return [TaskDTO.from_entity(task) for task in result]
