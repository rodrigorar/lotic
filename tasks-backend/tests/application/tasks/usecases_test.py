from datetime import datetime
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import DatabaseProvider
from src.domain.errors import InternalError
from tests.application.shared import MockedUnitOfWorkProvider
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.application import UnitOfWork, UnitOfWorkProvider
from src.domain.tasks import CreateTasks, DeleteTasks, ListTasksForAccount, \
    TasksBusinessRulesProvider, UpdateTasks
from src.application.tasks import TaskDTO, UseCaseCreateTasks, UseCaseUpdateTasks, \
    UseCaseDeleteTasks, UseCaseListTasksForUser

global create_tasks_br
global update_tasks_br
global delete_tasks_br
global list_account_tasks_br


class MockedTasksBusinessRulesProvider(TasksBusinessRulesProvider):

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


ACCOUNT_ID = uuid4()
TASK_1_ID = uuid4()
TASK_1_TITLE = "Task #1 Title"
TASK_1_DESCRIPTION = "Task #1 Description"
TASK_2_ID = uuid4()
TASK_2_TITLE = "Task #2 Title"
TASK_2_DESCRIPTION = "Task #2 Description"
TASK_3_ID = uuid4()
TASK_3_TITLE = "Task #3 Title"
TASK_3_DESCRIPTION = "Task #3 Description"
NOW = datetime.now()


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
        br_result = [TASK_1_ID, TASK_2_ID, TASK_3_ID]
        when(create_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        input_data = [
            TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]

        under_test = UseCaseCreateTasks(MockedUnitOfWorkProvider(), MockedTasksBusinessRulesProvider())
        result = under_test.execute(input_data)

        assert result is not None
        assert len(result) == 3
        for task_id in result:
            assert task_id in br_result

        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(create_tasks_br)

    def test_should_succeed_single_task(self):
        br_result = [TASK_1_ID]
        when(create_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        input_data = [TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID)]

        under_test = UseCaseCreateTasks(MockedUnitOfWorkProvider(), MockedTasksBusinessRulesProvider())
        result = under_test.execute(input_data)

        assert result is not None
        assert len(result) == 1
        assert result[0] == br_result[0]

        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(create_tasks_br)

    def test_should_fail_no_port(self):
        under_test = UseCaseCreateTasks(MockedUnitOfWorkProvider(), MockedTasksBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(create_tasks_br)

    def test_should_fail_create_tasks_br_error(self):
        when(create_tasks_br) \
            .execute(...) \
            .thenRaise(InternalError("Something went very wrong here"))

        input_data = [
            TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]

        under_test = UseCaseCreateTasks(MockedUnitOfWorkProvider(), MockedTasksBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(input_data)

        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(create_tasks_br)


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