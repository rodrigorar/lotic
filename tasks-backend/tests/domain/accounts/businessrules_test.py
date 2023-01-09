from datetime import datetime
import uuid

from mockito import mock, when
import pytest

from src.domain.errors import InternalError
from tests.domain.shared import DomainUnitTestsBase
from tests.shared import UnitOfWorkMockProvider

ACCOUNT_ID = uuid.uuid4()
ACCOUNT_EMAIL = "john.doe@mail.not"
ACCOUNT_PASSWORD = "passwd01"


class TestCreateAccount(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.accounts import Account, CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        test_input = Account.from_values(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).insert(mocked_unit_of_work, test_input).thenReturn(ACCOUNT_ID)

        under_test = CreateAccount(mocked_unit_of_work, mocked_account_repository)
        result = under_test.execute(test_input)

        assert result is not None, "Result cannot be None"
        assert result == ACCOUNT_ID, "Result as equal " + str(ACCOUNT_ID)

    def test_should_fail_no_port_provided(self):
        from src.domain.accounts import CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)

        under_test = CreateAccount(mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import Account, CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).insert(mocked_unit_of_work, ...).thenRaise(InternalError)

        test_input = Account.from_values(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        under_test = CreateAccount(mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(InternalError):
            under_test.execute(test_input)


class TestGetAccount(DomainUnitTestsBase):

    def test_should_succeed_get_account(self):
        from src.domain.accounts import Account, GetAccount, AccountRepository

        account_result = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ACCOUNT_ID).thenReturn(account_result)

        under_test = GetAccount(mocked_unit_of_work, mocked_account_repository)
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None, "Result cannot be empty."
        assert result == account_result, "Result differs from expected result"

    def test_should_succeed_get_account_no_result(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ACCOUNT_ID).thenReturn(None)

        under_test = GetAccount(mocked_unit_of_work, mocked_account_repository)
        result = under_test.execute(ACCOUNT_ID)

        assert result is None, "Result should be empty"

    def test_should_fail_no_account_id(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)

        under_test = GetAccount(mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository)\
            .get_by_id(mocked_unit_of_work, ACCOUNT_ID)\
            .thenRaise(InternalError("Something failed"))

        under_test = GetAccount(mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_ID)
