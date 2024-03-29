import uuid

from src.application import UnitOfWork
from src.application.tasks import UseCaseCreateTasks, UseCaseDeleteTasks, UseCaseListTasksForAccount, UseCaseUpdateTasks
from src.domain import LogProvider, NotFoundError
from src.domain.tasks import TasksRepository, Task, AccountTasksRepository, AccountTasks \
    , TasksBusinessRulesProvider, ListTasksForAccount, DeleteTasks, UpdateTasks, CreateTasks
from src.domain.tasks.businessrules import ListTasks
from src.infrastructure import UnitOfWorkProviderImpl
from src.infrastructure.accounts import AccountBusinessRulesProviderImpl


logger = LogProvider().get()


class TasksRepositoryImpl(TasksRepository):

    def insert_multiple(self, unit_of_work: UnitOfWork, tasks: list[Task]) -> None:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert tasks is not None, "Tasks list cannot be empty"

        query = unit_of_work.query()
        for task in tasks:
            query.add(task)

    def update_multiple(self, unit_of_work: UnitOfWork, tasks: list[Task]) -> tuple[list[uuid], list[uuid]]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert tasks is not None, "Tasks list cannot be empty"

        query = unit_of_work.query()
        existing_tasks = query.query(Task).filter(Task.id.in_([task.id for task in tasks]))

        for task in existing_tasks:
            update_data = list(filter(lambda entry: entry.get_id() == task.get_id(), tasks))

            task.title = update_data[0].title or task.title
            task.description = update_data[0].description or task.description
            task.position = update_data[0].position
            task.updated_at = update_data[0].updated_at

        query.flush()

    def get_by_id(self, unit_of_work: UnitOfWork, task_id: uuid):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_id is not None, "Task id cannot be empty"

        query = unit_of_work.query()
        return query.query(Task).filter_by(id=str(task_id)).first()

    def list_tasks(self, unit_of_work, task_ids: list[uuid]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_ids is not None, "Task ids cannot be null"

        query_manager = unit_of_work.query()
        query_result = query_manager.query(Task)\
            .filter(Task.id.in_([str(task_id) for task_id in task_ids]))\
            .all()

        return [
            Task(
                entry.get_id()
                , entry.title
                , entry.description
                , entry.position
                , entry.created_at
                , entry.updated_at
                , entry.get_owner_id()
            ) for entry in query_result]

    def delete_multiple(self, unit_of_work: UnitOfWork, task_ids: list[uuid]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_ids is not None, "Task ids cannot be empty"

        query = unit_of_work.query()
        for task_id in task_ids:
            entry = query.query(Task).filter_by(id=str(task_id)).first()
            if entry is not None:
                query.delete(entry)


class AccountTasksRepositoryImpl(AccountTasksRepository):

    def insert_multiple(self, unit_of_work: UnitOfWork, account_tasks: list[AccountTasks]) -> None:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_tasks is not None, "User Tasks cannot be empty"

        query = unit_of_work.query()
        for user_task in account_tasks:
            query.add(user_task)

    def list_account_tasks(self, unit_of_work: UnitOfWork, account_id: uuid) -> list[AccountTasks]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_id is not None, "Account id cannot be empty"

        query = unit_of_work.query()
        result = query.query(AccountTasks).filter_by(account_id=str(account_id))

        if result is None:
            result = []

        return result

    def delete_by_task_id(self, unit_of_work: UnitOfWork, task_id: uuid):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_id is not None, "Task id cannot be empty"

        query = unit_of_work.query()
        account_task = query.query(AccountTasks).filter_by(task_id=str(task_id)).first()
        if account_task is None:
            raise NotFoundError("No account task found for deletion")
        query.delete(account_task)

    def delete_multiple_by_task_id(self, unit_of_work: UnitOfWork, task_ids: list[uuid]) -> None:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_ids is not None, "Task ids list cannot be null"

        query_manager = unit_of_work.query()
        query_manager.query(AccountTasks) \
            .filter(AccountTasks.task_id.in_([str(task_id) for task_id in task_ids])) \
            .delete()


tasks_repository = TasksRepositoryImpl()
account_tasks_repository = AccountTasksRepositoryImpl()


class TasksBusinessRulesProviderImpl(TasksBusinessRulesProvider):

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        return CreateTasks(
            logger
            , unit_of_work
            , tasks_repository
            , account_tasks_repository)

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        return UpdateTasks(logger, unit_of_work, tasks_repository)

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        return DeleteTasks(
            logger
            , unit_of_work
            , tasks_repository
            , account_tasks_repository)

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForAccount:
        return ListTasksForAccount(
            logger
            , unit_of_work
            , tasks_repository
            , account_tasks_repository)

    @staticmethod
    def list_tasks(unit_of_work) -> ListTasks:
        return ListTasks(logger, unit_of_work, TasksRepositoryImpl())


unit_of_work_provider = UnitOfWorkProviderImpl()
tasks_business_rules_provider = TasksBusinessRulesProviderImpl()
account_business_rules_provider = AccountBusinessRulesProviderImpl()


class TasksUseCaseProvider:

    @staticmethod
    def create_task():
        return UseCaseCreateTasks(
            LogProvider().get()
            , unit_of_work_provider
            , tasks_business_rules_provider
            , account_business_rules_provider)

    @staticmethod
    def update_tasks():
        return UseCaseUpdateTasks(
            LogProvider().get()
            , unit_of_work_provider
            , tasks_business_rules_provider)

    @staticmethod
    def delete_tasks():
        return UseCaseDeleteTasks(
            LogProvider().get()
            , unit_of_work_provider
            , tasks_business_rules_provider)

    @staticmethod
    def list_tasks_for_user():
        return UseCaseListTasksForAccount(
            LogProvider().get()
            , unit_of_work_provider
            , tasks_business_rules_provider)
