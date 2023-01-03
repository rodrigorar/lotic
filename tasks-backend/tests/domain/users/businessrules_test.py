from datetime import datetime
from typing import Optional
import uuid

from mockito import mock, when
import pytest

from src.domain.errors import InternalError
from tests.domain.shared import DomainUnitTestsBase
from tests.shared import UnitOfWorkMockProvider

USER_ID = uuid.uuid4()
USER_EMAIL = "john.doe@mail.not"
USER_PASSWORD = "passwd01"


class TestCreateUser(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.users import User, CreateUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        test_input = User.from_values(USER_ID, USER_EMAIL, USER_PASSWORD, datetime.now(), datetime.now())

        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository).insert(mocked_unit_of_work, test_input).thenReturn(USER_ID)

        under_test = CreateUser(mocked_unit_of_work, mocked_user_repository)
        result = under_test.execute(test_input)

        assert result is not None, "Result cannot be None"
        assert result == USER_ID, "Result as equal " + str(USER_ID)

    def test_should_fail_no_port_provided(self):
        from src.domain.users import CreateUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_user_repository = mock(UserRepository)

        under_test = CreateUser(mocked_unit_of_work, mocked_user_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_repository_error(self):
        from src.domain.users import User, CreateUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository).insert(mocked_unit_of_work, ...).thenRaise(InternalError)

        test_input = User.from_values(USER_ID, USER_EMAIL, USER_PASSWORD, datetime.now(), datetime.now())

        under_test = CreateUser(mocked_unit_of_work, mocked_user_repository)
        with pytest.raises(InternalError):
            under_test.execute(test_input)


class TestGetUser(DomainUnitTestsBase):

    def test_should_succeed_get_user(self):
        from src.domain.users import User, GetUser, UserRepository

        user_result = User(USER_ID, USER_EMAIL, USER_PASSWORD, datetime.now(), datetime.now())

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository).get_by_id(mocked_unit_of_work, USER_ID).thenReturn(user_result)

        under_test = GetUser(mocked_unit_of_work, mocked_user_repository)
        result = under_test.execute(USER_ID)

        assert result is not None, "Result cannot be empty."
        assert result == user_result, "Result differs from expected result"

    def test_should_succeed_get_user_no_result(self):
        from src.domain.users import GetUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository).get_by_id(mocked_unit_of_work, USER_ID).thenReturn(None)

        under_test = GetUser(mocked_unit_of_work, mocked_user_repository)
        result = under_test.execute(USER_ID)

        assert result is None, "Result should be empty"

    def test_should_fail_no_user_id(self):
        from src.domain.users import GetUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_user_repository = mock(UserRepository)

        under_test = GetUser(mocked_unit_of_work, mocked_user_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_repository_error(self):
        from src.domain.users import User, GetUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository)\
            .get_by_id(mocked_unit_of_work, USER_ID)\
            .thenRaise(InternalError("Something failed"))

        under_test = GetUser(mocked_unit_of_work, mocked_user_repository)
        with pytest.raises(InternalError):
            under_test.execute(USER_ID)
