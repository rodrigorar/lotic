from functools import reduce
from logging import Logger
import uuid

from src.application import UnitOfWorkProvider, UseCase
from src.application.auth.shared import AuthorizationContext
from src.application.errors import AuthorizationError
from src.application.tasks.dto import TaskDTO
from src.domain import reducer_duplicated, ConflictError, NotFoundError
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain.tasks import Task, TasksBusinessRulesProvider


# FIXME: This should be a UseCaseCommand to be coherent with the CQS Pattern we wish to use
#   this has not been changed be cause we will need to change the API (Controller) and being so
#   we probably will need to use a BranchByAbstraction pattern.
class UseCaseCreateTasks(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider
            , account_br_provider: AccountBusinessRulesProvider):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider
        self.account_br_provider = account_br_provider

    def execute(self, tasks: list[TaskDTO]) -> list[uuid]:
        self.logger.info("Executing ---> UseCase[CreateTasks]")

        assert tasks is not None, "No tasks were provided"

        result = list()
        if len(tasks) != 0:
            owner_ids = [task.get_owner_id() for task in tasks] \
                if len(tasks) == 1 \
                else reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
            if len(owner_ids) > 1:
                raise ConflictError("Cannot create tasks for more than one owner at a time")

            if not AuthorizationContext.is_matching_account(owner_ids[0]):
                raise AuthorizationError('Unauthorized operation')

            with self.unit_of_work_provider.get() as unit_of_work:
                get_account_br = self.account_br_provider.get_account(unit_of_work)
                account = get_account_br.execute(owner_ids[0])
                if account is None:
                    raise NotFoundError("Non existent account")

                create_tasks_br = self.tasks_br_provider.create_tasks(unit_of_work)
                result = create_tasks_br.execute([task.to_entity() for task in tasks])

        return result


# FIXME: This should be a UseCaseCommand to be coherent with the CQS Pattern we wish to use
#   this has not been changed be cause we will need to change the API (Controller) and being so
#   we probably will need to use a BranchByAbstraction pattern.
class UseCaseUpdateTasks(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    @staticmethod
    def validate_tasks_owners(tasks: list[Task]) -> uuid:
        owner_ids = [task.get_owner_id() for task in tasks] \
            if len(tasks) == 1 \
            else reduce(reducer_duplicated, [task.get_owner_id() for task in tasks])
        if len(owner_ids) > 1 or not AuthorizationContext.is_matching_account(owner_ids[0]):
            raise AuthorizationError('Unauthorized operation')
        return owner_ids[0]

    def execute(self, tasks: list[TaskDTO]):
        self.logger.info("Executing ---> UseCase[UpdateTasks]")

        assert tasks is not None, "Tasks cannot be null"

        result = list()
        if len(tasks) != 0:
            with self.unit_of_work_provider.get() as unit_of_work:
                list_tasks_br = self.tasks_br_provider.list_tasks(unit_of_work)
                task_entities = list_tasks_br.execute([entry.get_id() for entry in tasks])

                if len(task_entities) == 0:
                    raise NotFoundError('No tasks found')
                self.validate_tasks_owners(task_entities)

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
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , tasks_br_provider: TasksBusinessRulesProvider):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.tasks_br_provider = tasks_br_provider

    def execute(self, account_id: uuid) -> list[TaskDTO]:
        self.logger.info("Executing ---> UseCase[ListTasksForAccount]")

        assert account_id is not None, "Account id cannot be null"

        if not AuthorizationContext.is_matching_account(account_id):
            raise AuthorizationError('Unauthorized operation')

        with self.unit_of_work_provider.get() as unit_of_work:
            list_account_tasks = self.tasks_br_provider.list_tasks_for_user(unit_of_work)
            result = list_account_tasks.execute(account_id)

        return [TaskDTO.from_entity(task) for task in result]
