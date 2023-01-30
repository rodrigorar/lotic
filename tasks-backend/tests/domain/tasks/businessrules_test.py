from datetime import datetime
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain.errors import ConflictError, InternalError
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
            mocked_unit_of_work
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
            mocked_unit_of_work
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
            mocked_unit_of_work
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
            mocked_unit_of_work
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

    def test_should_fail_multiple_owners(self):
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
                , ACCOUNT_2_ID)
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
        mocked_account_tasks_repository = mock(AccountTasksRepository)

        under_test = CreateTasks(
            mocked_unit_of_work
            , mocked_task_repository
            , mocked_account_tasks_repository)

        with pytest.raises(AssertionError):
            under_test.execute(task_list)

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
        result = under_test.execute(task_list)

        assert result is not None

        assert len(result) == 3
        task_id_list = [task.get_id() for task in task_list]
        for task_id in task_id_list:
            if task_id not in result:
                raise AssertionError("Task Id " + task_id + " should be in the result")

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
        result = under_test.execute(task_list)

        assert result is not None

        task_ids = result[1]
        assert len(task_ids) == 2
        task_id_list = [task.get_id() for task in task_list]
        for task_id in task_ids:
            if task_id not in task_id_list:
                raise AssertionError("Task Id " + task_id + " should be in the result")

        error_list = result[0]
        assert len(error_list) == 1

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

    def test_should_fail_multiple_owners(self):
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
                , ACCOUNT_2_ID)
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

        under_test = UpdateTasks(
            mocked_unit_of_work
            , mocked_task_repository)

        with pytest.raises(AssertionError):
            under_test.execute(task_list)

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
        raise NotImplementedError("TestListTasksForAccount#test_should_succeed is not implemented")

    def test_should_fail_no_port(self):
        raise NotImplementedError("TestListTasksForAccount#test_should_fail_no_port is not implemented")

    def test_should_fail_account_tasks_error(self):
        raise NotImplementedError("TestListTasksForAccount#test_should_fail_account_tasks_error is not implemented")
