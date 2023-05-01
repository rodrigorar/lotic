from functools import reduce
from logging import Logger
import uuid

from src.application import UnitOfWorkProvider, UseCase
from src.application.auth import AuthorizationContext
from src.application.errors import AuthorizationError
from src.application.tasks.dto import TaskDTO
from src.domain import reducer_duplicated, ConflictError, NotFoundError
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain.tasks import TasksBusinessRulesProvider


class UseCaseCreateTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider
            , account_br_provider: AccountBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.account_br_provider = account_br_provider
        self.logger = logger

    def execute(self, tasks: list[TaskDTO]) -> list[uuid]:
        assert tasks is not None, "No tasks were provided"
        # FIXME: This should be converted into the normal functioning of the use case and not
        #   be implemented as a safeguard
        if len(tasks) == 0:
            return list()

        owner_ids = [task.get_owner_id() for task in tasks] \
            if len(tasks) == 1 \
            else reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])

        if not AuthorizationContext.is_matching_account(owner_ids[0]):
            raise AuthorizationError('Unauthorized operation')

        self.logger.info("UseCase[CreateTasks](" + str(owner_ids[0]) + ")")

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
            , tasks_br_provider: TasksBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.logger = logger

    def execute(self, tasks: list[TaskDTO]):
        assert tasks is not None, "Tasks cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            list_tasks_br = self.tasks_br_provider.list_tasks(unit_of_work)
            task_entities = list_tasks_br.execute([entry.get_id() for entry in tasks])

            if len(task_entities) == 0:
                raise NotFoundError('No tasks found')

            owner_ids = [task.get_owner_id() for task in task_entities] \
                if len(task_entities) == 1 \
                else reduce(reducer_duplicated, [task.get_owner_id() for task in task_entities])
            if len(owner_ids) > 1 or not AuthorizationContext.is_matching_account(owner_ids[0]):
                raise AuthorizationError('Unauthorized operation')

            self.logger.info("UseCase[UpdateTasks]")

            update_tasks_br = self.tasks_br_provider.update_tasks(unit_of_work)
            result = update_tasks_br.execute([task.to_entity() for task in tasks])

        return result


class UseCaseDeleteTasks(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.logger = logger

    def execute(self, task_ids: list[uuid]):
        assert task_ids is not None, "Task id list cannot be null"

        self.logger.info("UseCase[DeleteTasks]")

        with self.unit_of_work_provider.get() as unit_of_work:
            list_tasks_br = self.tasks_br_provider.list_tasks(unit_of_work)
            task_entities = list_tasks_br.execute(task_ids)

            if len(task_entities) == 0:
                raise NotFoundError('No tasks found')

            owner_ids = [task.get_owner_id() for task in task_entities] \
                if len(task_entities) == 1 \
                else reduce(reducer_duplicated, [task.owner_id for task in task_entities])
            if len(owner_ids) > 1 or not AuthorizationContext.is_matching_account(owner_ids[0]):
                raise AuthorizationError('Unauthorized operation')

            delete_task = self.tasks_br_provider.delete_tasks(unit_of_work)
            delete_task.execute(task_ids)


class UseCaseListTasksForAccount(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.logger = logger

    def execute(self, account_id: uuid) -> list[TaskDTO]:
        assert account_id is not None, "Account id cannot be null"

        if not AuthorizationContext.is_matching_account(account_id):
            raise AuthorizationError('Unauthorized operation')

        self.logger.info("UseCase[ListTasksForAccount](" + str(account_id) + ")")

        with self.unit_of_work_provider.get() as unit_of_work:
            list_account_tasks = self.tasks_br_provider.list_tasks_for_user(unit_of_work)
            result = list_account_tasks.execute(account_id)

        return [TaskDTO.from_entity(task) for task in result]
