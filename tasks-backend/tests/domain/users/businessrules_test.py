from datetime import datetime
import uuid

from mockito import mock, when
import pytest

from src.domain.errors import InternalError
from tests.domain.shared import DomainUnitTestsBase
from tests.shared import UnitOfWorkMockProvider


class TestCreateUser(DomainUnitTestsBase):
    USER_ID = uuid.uuid4()

    def test_should_succeed(self):
        from src.domain.users import User, CreateUser, UserRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        test_input = User.from_values(self.USER_ID, 'john.doe@mail.not', 'passwd01', datetime.now(), datetime.now())

        mocked_user_repository = mock(UserRepository)
        when(mocked_user_repository).insert(mocked_unit_of_work, test_input).thenReturn(self.USER_ID)

        under_test = CreateUser(mocked_unit_of_work, mocked_user_repository)
        result = under_test.execute(test_input)

        assert result is not None, "Result cannot be None"
        assert result == self.USER_ID, "Result as equal " + str(self.USER_ID)

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

        test_input = User.from_values(self.USER_ID, 'john.doe@mail.not', 'passwd01', datetime.now(), datetime.now())

        under_test = CreateUser(mocked_unit_of_work, mocked_user_repository)
        with pytest.raises(InternalError):
            under_test.execute(test_input)
