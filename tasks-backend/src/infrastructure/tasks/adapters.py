from datetime import datetime
import uuid

from src.application import UnitOfWork
from src.application.tasks import UseCaseCreateTasks, UseCaseDeleteTasks, UseCaseListTasksForUser, UseCaseUpdateTasks
from src.domain.errors import NotFoundError
from src.domain.tasks import TasksRepository, Task, AccountTasksRepository, AccountTasks, TasksBusinessRulesProvider, \
    ListTasksForUser, DeleteTasks, UpdateTasks, CreateTasks
from src.infrastructure import UnitOfWorkProviderImpl


class TasksRepositoryImpl(TasksRepository):

    def insert_multiple(self, unit_of_work: UnitOfWork, tasks: list[Task]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert tasks is not None, "Tasks list cannot be empty"

        query = unit_of_work.query()
        for task in tasks:
            query.add(task)

        return [task.get_id() for task in tasks]

    def update_multiple(self, unit_of_work: UnitOfWork, tasks: list[Task]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert tasks is not None, "Tasks list cannot be empty"

        query = unit_of_work.query()
        not_found_list = []
        updated_list = []
        for task in tasks:
            entry = query.query(Task).filter_by(id=task.id).first()
            if entry is None:
                not_found_list.append(task.id)
            else:
                entry.title = task.title if task.title is not None else entry.title
                entry.description = task.description if task.description is not None else entry.description
                entry.updated_at = datetime.now()

                query.add(entry)
                updated_list.append(entry.id)

        return updated_list, not_found_list

    def delete_multiple(self, unit_of_work: UnitOfWork, task_ids: list[uuid]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_ids is not None, "Task ids cannot be empty"

        query = unit_of_work.query()
        for task_id in task_ids:
            entry = query.query(Task).filter_by(id=task_id).first()
            if entry is not None:
                query.delete(entry)


class UserTasksRepositoryImpl(AccountTasksRepository):

    def insert_multiple(self, unit_of_work: UnitOfWork, account_tasks: list[AccountTasks]):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_tasks is not None, "User Tasks cannot be empty"

        query = unit_of_work.query()
        for user_task in account_tasks:
            query.add(user_task)

        return [(user_task.get_account_id(), user_task.get_task_id()) for user_task in account_tasks]

    def list(self, unit_of_work: UnitOfWork, account_id: uuid) -> list[AccountTasks]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_id is not None, "Account id cannot be empty"

        query = unit_of_work.query()
        result = query.select(AccountTasks).filter_by(account_id=account_id)

        if result is None:
            result = []

        return result

    def delete_by_task_id(self, unit_of_work: UnitOfWork, task_id: uuid):
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert task_id is not None, "Task id cannot be empty"

        query = unit_of_work.query()
        account_task = query.query(AccountTasks).filter_by(task_id=task_id).first()
        if account_task is None:
            raise NotFoundError("No account task found for deletion")
        query.delete(account_task)


class TasksBusinessRulesProviderImpl(TasksBusinessRulesProvider):

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        return CreateTasks(unit_of_work, TasksRepositoryImpl(), UserTasksRepositoryImpl())

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        return UpdateTasks(unit_of_work, TasksRepositoryImpl(), UserTasksRepositoryImpl())

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        return DeleteTasks(unit_of_work, TasksRepositoryImpl(), UserTasksRepositoryImpl())

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForUser:
        return ListTasksForUser(unit_of_work, TasksRepositoryImpl(), UserTasksRepositoryImpl())


unit_of_work_provider = UnitOfWorkProviderImpl()
tasks_business_rules_provider = TasksBusinessRulesProviderImpl()


class TasksUseCaseProvider:

    @staticmethod
    def create_task():
        return UseCaseCreateTasks(unit_of_work_provider, tasks_business_rules_provider)

    @staticmethod
    def update_tasks():
        return UseCaseUpdateTasks(unit_of_work_provider, tasks_business_rules_provider)

    @staticmethod
    def delete_tasks():
        return UseCaseDeleteTasks(unit_of_work_provider, tasks_business_rules_provider)

    @staticmethod
    def list_tasks_for_user():
        return UseCaseListTasksForUser(unit_of_work_provider, tasks_business_rules_provider)