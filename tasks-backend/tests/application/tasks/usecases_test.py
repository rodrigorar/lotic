from mockito import mock
import pytest

from src.domain import DatabaseProvider
from tests.application.shared import ApplicationUnitTestsBase
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.domain.tasks import CreateTasks, DeleteTasks, ListTasksForAccount, \
    TasksBusinessRulesProvider, UpdateTasks
from src.application.tasks import UseCaseCreateTasks, UseCaseUpdateTasks, \
    UseCaseDeleteTasks, UseCaseListTasksForUser

global create_tasks_br
global update_tasks_br
global delete_tasks_br
global list_account_tasks_br


class MockTasksBusinessRulesProvider(TasksBusinessRulesProvider):

    @staticmethod
    def create_tasks(unit_of_work) -> CreateTasks:
        return create_tasks_br

    @staticmethod
    def update_tasks(unit_of_work) -> UpdateTasks:
        return update_tasks_br

    @staticmethod
    def delete_tasks(unit_of_work) -> DeleteTasks:
        return delete_tasks_br

    @staticmethod
    def list_tasks_for_user(unit_of_work) -> ListTasksForAccount:
        return list_account_tasks_br


class TasksUseCaseBaseTest:

    @pytest.fixture(autouse=True)
    def setup_mock_aspect(self):
        global create_tasks_br
        global update_tasks_br
        global delete_tasks_br
        global list_account_tasks_br

        create_tasks_br = mock(CreateTasks)
        update_tasks_br = mock(UpdateTasks)
        delete_tasks_br = mock(DeleteTasks)
        list_account_tasks_br = mock(ListTasksForAccount)
        yield
        create_tasks_br = None
        update_tasks_br = None
        delete_tasks_br = None
        list_account_tasks_br = None


class TestUseCaseCreateTasks(TasksUseCaseBaseTest):

    def test_should_succeed(self):
        raise NotImplementedError("TestUseCaseCreateTasks#test_should_succeed is not implemented")

    def test_should_succeed_single_task(self):
        raise NotImplementedError("TestUseCaseCreateTasks#test_should_succeed_single_task is not implemented")

    def test_should_fail_no_port(self):
        raise NotImplementedError("TestUseCaseCreateTasks#test_should_fail_no_port is not implemented")

    def test_should_fail_create_tasks_br_error(self):
        raise NotImplementedError("TestUseCaseCreateTAsks#test_should_fail_create_tasks_br_error is not implemented")


class TestUseCaseUpdateTasks(TasksUseCaseBaseTest):

    def test_should_succeed(self):
        raise NotImplementedError("TestUseCaseUpdateTasks#test_should_succeed is not implemented")

    def test_should_succeed_single_task(self):
        raise NotImplementedError("TestUseCaseUpdateTasks#test_should_succeed is not implemented")

    def test_should_fail_no_port(self):
        raise NotImplementedError("TestUseCaseUpdateTasks#test_should_fail_no_port is not implemented")

    def test_should_fail_create_tasks_br_error(self):
        raise NotImplementedError("TestUseCaseUpdateTasks#test_should_fail_create_tasks_br_error is not implemented")


class TestUseCaseDeleteTasks(TasksUseCaseBaseTest):

    def test_should_succeed(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_succeed is not implemented")

    def test_should_succeed_single_task_id(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_succeed is not implemented")

    def test_should_fail_no_port(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_fail_no_port is not implemented")

    def test_should_fail_create_tasks_br_error(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_fail_create_tasks_br_error is not implemented")


class TestUseCaseListAccountTasks(TasksUseCaseBaseTest):

    def test_should_succeed(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_succeed is not implemented")

    def test_should_succeed_no_results(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_succeed is not implemented")

    def test_should_fail_no_port(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_fail_no_port is not implemented")

    def test_should_fail_create_tasks_br_error(self):
        raise NotImplementedError("TestUseCaseDeleteTasks#test_should_fail_create_tasks_br_error is not implemented")