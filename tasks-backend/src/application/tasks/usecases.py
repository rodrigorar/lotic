from functools import reduce
import uuid

from src.domain.errors import ConflictError, NotFoundError

from src.application import UnitOfWorkProvider, UseCase
from src.application.tasks import TaskDTO
from src.domain import reducer_duplicated
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain.tasks import TasksBusinessRulesProvider


class UseCaseCreateTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider
            , account_br_provider: AccountBusinessRulesProvider):
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.account_br_provider = account_br_provider

    def execute(self, tasks: list[TaskDTO]) -> list[uuid]:
        assert tasks is not None, "No tasks were provided"

        owner_ids = [task.owner_id for task in tasks] \
            if len(tasks) == 1 \
            else reduce(reducer_duplicated, [task.owner_id for task in tasks])

        if len(owner_ids) > 1:
            raise ConflictError("Cannot create tasks for more than one owner at a time")

        with self.unit_of_work_provider.get() as unit_of_work:
            get_account_br = self.account_br_provider.get_account(unit_of_work)
            account = get_account_br.execute(owner_ids[0])
            if account is None:
                raise NotFoundError("Non existent account")

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
