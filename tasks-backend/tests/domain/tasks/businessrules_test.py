from datetime import datetime
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import ConflictError, InternalError
from tests.application.shared import MockedLogger
from tests.domain.shared import DomainUnitTestsBase
from tests.shared import UnitOfWorkMockProvider

ACCOUNT_1_ID = uuid4()
ACCOUNT_2_ID = uuid4()
TASK_1_ID = uuid4()
TASK_1_TITLE = "Task Title #1"
TASK_1_DESCRIPTION = "Test Description #1"
TASK_2_ID = uuid4()
TASK_2_TITLE = "Task Title #2"
TASK_2_DESCRIPTION = "Task Description #2"
TASK_3_ID = uuid4()
TASK_3_TITLE = "Task Title #3"
TASK_3_DESCRIPTION = "Task Description #3"


class TestCreateTasks(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.tasks import Task, TasksRepository, AccountTasksRepository, CreateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .insert_multiple(...) \
            .thenReturn([task.get_id() for task in task_list])

        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .insert_multiple(...) \
            .thenReturn([(task.get_owner_id(), task.get_id()) for task in task_list])

        under_test = CreateTasks(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)
        result = under_test.execute(task_list)

        assert result is not None
        assert len(result) == 3
        task_id_list = [task.get_id() for task in task_list]
        for task_id in task_id_list:
            if task_id not in result:
                raise AssertionError("Task Id " + task_id + " should be in the result")

        verify(mocked_task_repository, times=1).insert_multiple(...)
        verify(mocked_account_tasks_repository, times=1).insert_multiple(...)
        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

    def test_should_fail_no_port_provided(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, CreateTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_task_repository = mock(TasksRepository)
        mocked_account_tasks_repository = mock(AccountTasksRepository)

        under_test = CreateTasks(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

    def test_should_fail_tasks_repository_error(self):
        from src.domain.tasks import Task, TasksRepository, AccountTasksRepository, CreateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .insert_multiple(...) \
            .thenRaise(ConflictError("Failed to insert the new task"))

        mocked_account_tasks_repository = mock(AccountTasksRepository)

        under_test = CreateTasks(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

        with pytest.raises(ConflictError):
            under_test.execute(task_list)

    def test_should_fail_account_tasks_repository_error(self):
        from src.domain.tasks import Task, TasksRepository, AccountTasksRepository, CreateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .insert_multiple(...) \
            .thenReturn([task.get_id() for task in task_list])

        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .insert_multiple(...) \
            .thenRaise(ConflictError("Failed to insert the new AccountTask"))

        under_test = CreateTasks(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

        with pytest.raises(ConflictError):
            under_test.execute(task_list)

        verify(mocked_task_repository).insert_multiple(...)
        verify(mocked_account_tasks_repository).insert_multiple(...)
        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)


class TestUpdateTasks(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.tasks import Task, TasksRepository, UpdateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .update_multiple(...) \
            .thenReturn([task.get_id() for task in task_list])

        under_test = UpdateTasks(
            mocked_unit_of_work
            , mocked_task_repository)
        under_test.execute(task_list)

        verify(mocked_task_repository).update_multiple(...)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_task_repository)

    def test_should_succeed_partial_not_found(self):
        from src.domain.tasks import Task, TasksRepository, UpdateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_3_TITLE
                , TASK_3_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .update_multiple(...) \
            .thenReturn(([TASK_3_ID], [TASK_1_ID, TASK_2_ID]))

        under_test = UpdateTasks(
            mocked_unit_of_work
            , mocked_task_repository)
        under_test.execute(task_list)

        verify(mocked_task_repository).update_multiple(...)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_task_repository)

    def test_should_fail_no_port(self):
        from src.domain.tasks import TasksRepository, UpdateTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_task_repository = mock(TasksRepository)

        under_test = UpdateTasks(
            mocked_unit_of_work
            , mocked_task_repository)

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_task_repository)

    def test_should_fail_tasks_repository_error(self):
        from src.domain.tasks import Task, TasksRepository, UpdateTasks

        task_list = [
            Task(
                TASK_1_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_2_ID
                , TASK_2_TITLE
                , TASK_2_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
            , Task(
                TASK_3_ID
                , TASK_1_TITLE
                , TASK_1_DESCRIPTION
                , datetime.now()
                , datetime.now()
                , ACCOUNT_1_ID)
        ]

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_task_repository = mock(TasksRepository)
        when(mocked_task_repository) \
            .update_multiple(...) \
            .thenRaise(ConflictError("Failed to update task"))

        under_test = UpdateTasks(
            mocked_unit_of_work
            , mocked_task_repository)

        with pytest.raises(ConflictError):
            under_test.execute(task_list)

        verify(mocked_task_repository).update_multiple(...)
        
        verifyNoMoreInteractions(mocked_unit_of_work, mocked_task_repository)


class TestDeleteTasks(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, DeleteTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_tasks_repository = mock(TasksRepository)
        when(mocked_tasks_repository) \
            .delete_multiple(...) \
            .thenReturn(None)

        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .delete_by_task_id(...) \
            .thenReturn(None)

        test_input = [uuid4(), uuid4(), uuid4()]
        under_test = DeleteTasks(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)
        under_test.execute(test_input)

        verify(mocked_tasks_repository, times=1).delete_multiple(...)
        verify(mocked_account_tasks_repository, times=3).delete_by_task_id(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_no_port(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, DeleteTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_tasks_repository = mock(TasksRepository)
        mocked_account_tasks_repository = mock(AccountTasksRepository)

        under_test = DeleteTasks(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_task_repository_error(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, DeleteTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_tasks_repository = mock(TasksRepository)
        when(mocked_tasks_repository)\
            .delete_multiple(...)\
            .thenRaise(InternalError("Something went very wrong here"))

        mocked_account_tasks_repository = mock(AccountTasksRepository)

        test_input = [uuid4(), uuid4(), uuid4()]
        under_test = DeleteTasks(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(mocked_tasks_repository, times=1).delete_multiple(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_account_tasks_repository_error(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, DeleteTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_tasks_repository = mock(TasksRepository)
        when(mocked_tasks_repository).delete_multiple(...)

        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .delete_by_task_id(...) \
            .thenRaise(InternalError("Something went very wrong here"))

        test_input = [uuid4(), uuid4(), uuid4()]
        under_test = DeleteTasks(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(mocked_tasks_repository, times=1).delete_multiple(...)
        verify(mocked_account_tasks_repository, times=1).delete_by_task_id(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)


class TestListTasksForAccount(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, \
            ListTasksForAccount, Task, AccountTasks

        account_id = uuid4()
        task_1_id = uuid4()
        task_2_id = uuid4()
        task_3_id = uuid4()
        now = datetime.now()

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        task_1 = Task(task_1_id, "Task #1 Title", "Task #1 Description", now, now, account_id)
        task_2 = Task(task_2_id, "Task #2 Title", "Task #2 Description", now, now, account_id)
        task_3 = Task(task_3_id, "Task #3 Title", "Task #3 Description", now, now, account_id)
        mocked_tasks_repository = mock(TasksRepository)
        when(mocked_tasks_repository) \
            .get_by_id(mocked_unit_of_work, task_1_id) \
            .thenReturn(task_1)
        when(mocked_tasks_repository) \
            .get_by_id(mocked_unit_of_work, task_2_id) \
            .thenReturn(task_2)
        when(mocked_tasks_repository) \
            .get_by_id(mocked_unit_of_work, task_3_id) \
            .thenReturn(task_3)

        account_tasks = [
            AccountTasks(account_id, task_1_id),
            AccountTasks(account_id, task_2_id),
            AccountTasks(account_id, task_3_id)
        ]
        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .list_account_tasks(...) \
            .thenReturn(account_tasks)

        under_test = ListTasksForAccount(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)
        result = under_test.execute(account_id)

        assert result is not None
        assert len(result) == 3
        task_ids = [task_1_id, task_2_id, task_3_id]
        for entry in result:
            assert entry.get_id() in task_ids

        verify(mocked_tasks_repository, times=1).get_by_id(mocked_unit_of_work, task_1_id)
        verify(mocked_tasks_repository, times=1).get_by_id(mocked_unit_of_work, task_2_id)
        verify(mocked_tasks_repository, times=1).get_by_id(mocked_unit_of_work, task_3_id)
        verify(mocked_account_tasks_repository, times=1).list_account_tasks(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_no_port(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, \
            ListTasksForAccount, Task, AccountTasks

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_tasks_repository = mock(TasksRepository)
        mocked_account_tasks_repository = mock(AccountTasksRepository)

        under_test = ListTasksForAccount(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_account_tasks_error(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, \
            ListTasksForAccount, AccountTasks

        account_id = uuid4()
        task_1_id = uuid4()
        task_2_id = uuid4()
        task_3_id = uuid4()

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_tasks_repository = mock(TasksRepository)
        when(mocked_tasks_repository) \
            .get_by_id(mocked_unit_of_work, task_1_id) \
            .thenRaise(InternalError("Something very wrong has happened here"))

        account_tasks = [
            AccountTasks(account_id, task_1_id),
            AccountTasks(account_id, task_2_id),
            AccountTasks(account_id, task_3_id)
        ]
        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .list_account_tasks(...) \
            .thenReturn(account_tasks)

        under_test = ListTasksForAccount(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(InternalError):
            under_test.execute(account_id)

        verify(mocked_tasks_repository, times=1).get_by_id(mocked_unit_of_work, task_1_id)
        verify(mocked_account_tasks_repository, times=1).list_account_tasks(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

    def test_should_fail_tasks_repository_error(self):
        from src.domain.tasks import TasksRepository, AccountTasksRepository, \
            ListTasksForAccount, Task, AccountTasks

        account_id = uuid4()

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_tasks_repository = mock(TasksRepository)

        mocked_account_tasks_repository = mock(AccountTasksRepository)
        when(mocked_account_tasks_repository) \
            .list_account_tasks(...) \
            .thenRaise(InternalError("Something very wrong has happened here"))

        under_test = ListTasksForAccount(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)

        with pytest.raises(InternalError):
            under_test.execute(account_id)

        verify(mocked_account_tasks_repository, times=1).list_account_tasks(...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_tasks_repository
            , mocked_account_tasks_repository)
