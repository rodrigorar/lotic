from datetime import datetime
from unittest.mock import MagicMock, patch
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import DatabaseProvider
from src.domain import InternalError, NotFoundError
from tests.application.shared import MockedUnitOfWorkProvider, MockedLogger
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.domain.accounts import Account, AccountBusinessRulesProvider, CreateAccount, GetAccount, \
    ValidateAccountEmail
from src.domain.tasks import CreateTasks, DeleteTasks, ListTasksForAccount, \
    Task, TasksBusinessRulesProvider, UpdateTasks, ListTasks
from src.application.tasks import TaskDTO, UseCaseCreateTasks, UseCaseUpdateTasks, \
    UseCaseDeleteTasks, UseCaseListTasksForAccount
from src.application.auth.shared import AuthorizationContext

global create_tasks_br
global update_tasks_br
global delete_tasks_br
global list_account_tasks_br
global list_tasks_br
global get_account_br


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

    @staticmethod
    def list_tasks(unit_of_work) -> ListTasks:
        return list_tasks_br


class MockedAccountBusinessRulesProvider(AccountBusinessRulesProvider):

    @staticmethod
    def create_account(unit_of_work) -> CreateAccount:
        raise NotImplementedError('Create account provider is not implemented')

    @staticmethod
    def validate_account_email(unit_of_work) -> ValidateAccountEmail:
        raise NotImplementedError('Validate account email provider is not implemented')

    @staticmethod
    def get_account(unit_of_work) -> GetAccount:
        return get_account_br


ACCOUNT_ID = uuid4()

TASK_1_ID = uuid4()
TASK_1_TITLE = "Task #1 Title"
TASK_1_NEW_TITLE = "Task #1 New Title"
TASK_1_DESCRIPTION = "Task #1 Description"
TASK_1_NEW_DESCRIPTION = "Task #1 New Description"

TASK_2_ID = uuid4()
TASK_2_TITLE = "Task #2 Title"
TASK_2_NEW_TITLE = "Task #2 New Title"
TASK_2_DESCRIPTION = "Task #2 Description"
TASK_2_NEW_DESCRIPTION = "Task #2 New Description"

TASK_3_ID = uuid4()
TASK_3_TITLE = "Task #3 Title"
TASK_3_NEW_TITLE = "Task #3 New Title"
TASK_3_DESCRIPTION = "Task #3 Description"
TASK_3_NEW_DESCRIPTION = "Task #3 New Description"

NOW = datetime.now()


class TasksUseCaseBaseTest:

    @pytest.fixture(autouse=True)
    def setup_mock_aspect(self):
        global create_tasks_br
        global update_tasks_br
        global delete_tasks_br
        global list_account_tasks_br
        global list_tasks_br
        global get_account_br

        create_tasks_br = mock(CreateTasks)
        update_tasks_br = mock(UpdateTasks)
        delete_tasks_br = mock(DeleteTasks)
        list_account_tasks_br = mock(ListTasksForAccount)
        list_tasks_br = mock(ListTasks)
        get_account_br = mock(GetAccount)
        yield
        create_tasks_br = None
        update_tasks_br = None
        delete_tasks_br = None
        list_account_tasks_br = None
        list_tasks_br = None
        get_account_br = None


class TestUseCaseCreateTasks(TasksUseCaseBaseTest):

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    @patch.object(AuthorizationContext, 'is_known_account', MagicMock(return_value=True))
    def test_should_succeed(self):
        when(get_account_br) \
            .execute(...) \
            .thenReturn(Account(uuid4(), 'test@mail.com', '123456', NOW, NOW))

        br_result = [TASK_1_ID, TASK_2_ID, TASK_3_ID]
        when(create_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        input_data = [
            TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]

        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())
        result = under_test.execute(input_data)

        assert result is not None
        assert len(result) == 3
        for task_id in result:
            assert task_id in br_result

        verify(get_account_br).execute(...)
        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(get_account_br, create_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    @patch.object(AuthorizationContext, 'is_known_account', MagicMock(return_value=True))
    def test_should_succeed_single_task(self):
        when(get_account_br) \
            .execute(...) \
            .thenReturn(Account(uuid4(), 'test@mail.com', '123456', NOW, NOW))

        br_result = [TASK_1_ID]
        when(create_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        input_data = [TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID)]

        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())
        result = under_test.execute(input_data)

        assert result is not None
        assert len(result) == 1
        assert result[0] == br_result[0]

        verify(get_account_br).execute(...)
        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(get_account_br, create_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    @patch.object(AuthorizationContext, 'is_known_account', MagicMock(return_value=True))
    def test_should_succeed_empty_task_list(self):
        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())
        result = under_test.execute([])

        assert result is not None
        assert len(result) == 0

        verifyNoMoreInteractions(get_account_br, create_tasks_br)

    def test_should_fail_no_port(self):
        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(create_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    @patch.object(AuthorizationContext, 'is_known_account', MagicMock(return_value=True))
    def test_should_fail_create_tasks_br_error(self):
        when(get_account_br) \
            .execute(...) \
            .thenReturn(Account(uuid4(), 'test@mail.com', '123456', NOW, NOW))

        when(create_tasks_br) \
            .execute(...) \
            .thenRaise(InternalError("Something went very wrong here"))

        input_data = [
            TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]

        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(input_data)

        verify(get_account_br).execute(...)
        verify(create_tasks_br).execute(...)

        verifyNoMoreInteractions(get_account_br, create_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    @patch.object(AuthorizationContext, 'is_known_account', MagicMock(return_value=True))
    def test_should_fail_get_account_br_error(self):
        when(get_account_br) \
            .execute(...) \
            .thenReturn(None)

        input_data = [
            TaskDTO(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]

        under_test = UseCaseCreateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedAccountBusinessRulesProvider())

        with pytest.raises(NotFoundError):
            under_test.execute(input_data)

        verify(get_account_br).execute(...)

        verifyNoMoreInteractions(get_account_br, create_tasks_br)


class TestUseCaseUpdateTasks(TasksUseCaseBaseTest):

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(), ACCOUNT_ID)
            , Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, datetime.now(), datetime.now(), ACCOUNT_ID)
            , Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, datetime.now(), datetime.now(), ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        update_br_result = [TASK_1_ID, TASK_2_ID, TASK_3_ID]
        when(update_tasks_br) \
            .execute(...) \
            .thenReturn(update_br_result)

        test_input = [
            TaskDTO(TASK_1_ID, TASK_1_NEW_TITLE, TASK_1_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_NEW_TITLE, TASK_2_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_NEW_TITLE, TASK_3_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(test_input)

        assert result is not None
        assert len(result) == 3
        for task_id in result:
            assert task_id in update_br_result

        verify(list_tasks_br).execute(...)
        verify(update_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, update_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_single_task(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        update_tasks_br_result = [TASK_1_ID]
        when(update_tasks_br) \
            .execute(...) \
            .thenReturn(update_tasks_br_result)

        test_input = [TaskDTO(TASK_1_ID, TASK_1_NEW_TITLE, TASK_1_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID)]
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(test_input)

        assert result is not None
        assert len(result) == 1
        assert result[0] == update_tasks_br_result[0]

        verify(list_tasks_br).execute(...)
        verify(update_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, update_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_with_partial_errors(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
            , Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
            , Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        update_tasks_br_result = [TASK_1_ID, TASK_2_ID]
        update_tasks_br_not_found_result = [TASK_3_ID]
        when(update_tasks_br) \
            .execute(...) \
            .thenReturn((update_tasks_br_not_found_result, update_tasks_br_result))

        test_input = [
            TaskDTO(TASK_1_ID, TASK_1_NEW_TITLE, TASK_1_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_NEW_TITLE, TASK_2_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_NEW_TITLE, TASK_3_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(test_input)

        assert result is not None
        assert len(result[1]) == 2
        for task_id in result[1]:
            assert task_id in update_tasks_br_result
        assert len(result[0]) == 1

        verify(list_tasks_br).execute(...)
        verify(update_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, update_tasks_br)

    @patch.object(AuthorizationContext, "is_matching_account", MagicMock(return_value=True))
    def test_should_fail_empty_input(self):
        list_task_br_result = []
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        test_input = [TaskDTO(TASK_1_ID, TASK_1_NEW_TITLE, TASK_1_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID)]
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())

        with pytest.raises(NotFoundError):
            under_test.execute(test_input)

        verify(list_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, update_tasks_br)

    def test_should_fail_no_port(self):
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(update_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_update_tasks_br_error(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
            , Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
            , Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        when(update_tasks_br) \
            .execute(...) \
            .thenRaise(InternalError("Something went very very wrong"))

        test_input = [
            TaskDTO(TASK_1_ID, TASK_1_NEW_TITLE, TASK_1_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_2_ID, TASK_2_NEW_TITLE, TASK_2_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            TaskDTO(TASK_3_ID, TASK_3_NEW_TITLE, TASK_3_NEW_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]
        under_test = UseCaseUpdateTasks(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(list_tasks_br).execute(...)
        verify(update_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, update_tasks_br)


# TODO: Should test authorization code as well, not only the happy path
class TestUseCaseDeleteTasks(TasksUseCaseBaseTest):

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
            , Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
            , Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        when(delete_tasks_br) \
            .execute(...) \
            .thenReturn()

        test_input = [TASK_1_ID, TASK_2_ID, TASK_3_ID]
        under_test = UseCaseDeleteTasks(
            MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedLogger())
        under_test.execute(test_input)

        verify(list_tasks_br).execute(...)
        verify(delete_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, delete_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_single_task_id(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        when(delete_tasks_br) \
            .execute(...) \
            .thenReturn()

        test_input = [TASK_1_ID]
        under_test = UseCaseDeleteTasks(
            MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedLogger())
        under_test.execute(test_input)

        verify(list_tasks_br).execute(...)
        verify(delete_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, delete_tasks_br)

    def test_should_fail_no_port(self):
        under_test = UseCaseDeleteTasks(
            MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedLogger())

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(delete_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_create_tasks_br_error(self):
        list_task_br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, datetime.now(), datetime.now(),
                 ACCOUNT_ID)
            , Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
            , Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, datetime.now(), datetime.now(),
                   ACCOUNT_ID)
        ]
        when(list_tasks_br) \
            .execute(...) \
            .thenReturn(list_task_br_result)

        when(delete_tasks_br) \
            .execute(...) \
            .thenRaise(InternalError("Something went very very wrong"))

        test_input = [TASK_1_ID, TASK_2_ID, TASK_3_ID]
        under_test = UseCaseDeleteTasks(
            MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider()
            , MockedLogger())

        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(list_tasks_br).execute(...)
        verify(delete_tasks_br).execute(...)

        verifyNoMoreInteractions(list_tasks_br, delete_tasks_br)


# TODO: Should test authorization code as well, not only the happy path
class TestUseCaseListAccountTasks(TasksUseCaseBaseTest):

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed(self):
        br_result = [
            Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            Task(TASK_2_ID, TASK_2_TITLE, TASK_2_DESCRIPTION, NOW, NOW, ACCOUNT_ID),
            Task(TASK_3_ID, TASK_3_TITLE, TASK_3_DESCRIPTION, NOW, NOW, ACCOUNT_ID)
        ]
        when(list_account_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        under_test = UseCaseListTasksForAccount(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None
        assert len(result) == 3
        assert type(result[0]) == TaskDTO
        task_ids = [task.get_id() for task in br_result]
        for entry in result:
            assert entry.get_id() in task_ids

        verify(list_account_tasks_br).execute(...)

        verifyNoMoreInteractions(list_account_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_single_result(self):
        br_result = [Task(TASK_1_ID, TASK_1_TITLE, TASK_1_DESCRIPTION, NOW, NOW, ACCOUNT_ID)]
        when(list_account_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        under_test = UseCaseListTasksForAccount(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None
        assert len(result) == 1
        assert type(result[0]) == TaskDTO
        assert result[0].get_id() == br_result[0].get_id()

        verify(list_account_tasks_br).execute(...)

        verifyNoMoreInteractions(list_account_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_no_results(self):
        br_result = []
        when(list_account_tasks_br) \
            .execute(...) \
            .thenReturn(br_result)

        under_test = UseCaseListTasksForAccount(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None
        assert len(result) == 0

        verify(list_account_tasks_br).execute(...)

        verifyNoMoreInteractions(list_account_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_no_port(self):
        under_test = UseCaseListTasksForAccount(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(list_account_tasks_br)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_create_tasks_br_error(self):
        when(list_account_tasks_br) \
            .execute(...) \
            .thenRaise(InternalError("Something as gone very very wrong"))

        under_test = UseCaseListTasksForAccount(
            MockedLogger()
            , MockedUnitOfWorkProvider()
            , MockedTasksBusinessRulesProvider())

        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_ID)

        verify(list_account_tasks_br).execute(...)

        verifyNoMoreInteractions(list_account_tasks_br)
