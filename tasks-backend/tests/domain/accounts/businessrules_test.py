from datetime import datetime
import uuid

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain.errors import InternalError, NotFoundError
from tests.application.shared import MockedLogger
from tests.domain.shared import DomainUnitTestsBase
from tests.shared import DummyLogger, UnitOfWorkMockProvider

ACCOUNT_ID = uuid.uuid4()
ACCOUNT_EMAIL = "john.doe@mail.not"
ACCOUNT_EMAIL_UNKNOWN = "unknown@mail.not"
ACCOUNT_EMAIL_INVALID = "llaksiouirekkewoidkoid"
ACCOUNT_PASSWORD = "passwd01"
ACCOUNT_LANGUAGE = "en"


class TestCreateAccount(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.accounts import Account, CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        test_input = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository) \
            .insert(mocked_unit_of_work, test_input) \
            .thenReturn(ACCOUNT_ID)

        under_test = CreateAccount(
            DummyLogger()
            , mocked_unit_of_work
            , mocked_account_repository)
        result = under_test.execute(test_input)

        assert result is not None, "Result cannot be None"
        assert result == ACCOUNT_ID, "Result as equal " + str(ACCOUNT_ID)

        verify(mocked_account_repository).insert(mocked_unit_of_work, test_input)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_account_repository)

    def test_should_fail_no_account_provided(self):
        from src.domain.accounts import CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)

        under_test = CreateAccount(
            DummyLogger()
            , mocked_unit_of_work
            , mocked_account_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_account_repository)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import Account, CreateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).insert(mocked_unit_of_work, ...).thenRaise(InternalError)

        test_input = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        under_test = CreateAccount(
            DummyLogger()
            , mocked_unit_of_work
            , mocked_account_repository)
        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(mocked_account_repository).insert(mocked_unit_of_work, ...)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_account_repository)


# CONTINUE HERE
class TestUpdateAccount(DomainUnitTestsBase):
    def test_should_succeed_update_account(self):
        from src.domain.accounts import Account, UpdateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        account = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_PASSWORD
            , datetime.now()
            , datetime.now())

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ...).thenReturn(account)
        when(mocked_account_repository).update(mocked_unit_of_work, ...)

        test_input = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        under_test = UpdateAccount(DummyLogger(), mocked_unit_of_work, mocked_account_repository)
        under_test.execute(test_input)

        verify(mocked_account_repository).get_by_id(mocked_unit_of_work, ...)
        verify(mocked_account_repository).update(mocked_unit_of_work, ...)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_account_repository)

    def test_should_fail_non_existent_account(self):
        from src.domain.accounts import Account, UpdateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ...).thenReturn(None)

        test_input = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        under_test = UpdateAccount(DummyLogger(), mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(NotFoundError):
            under_test.execute(test_input)

        verify(mocked_account_repository).get_by_id(mocked_unit_of_work, ...)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_account_repository)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import Account, UpdateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        account = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_PASSWORD
            , datetime.now()
            , datetime.now())

        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ...).thenReturn(account)
        when(mocked_account_repository).update(mocked_unit_of_work, ...).thenRaise(InternalError)

        test_input = Account.from_values(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        under_test = UpdateAccount(DummyLogger(), mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(InternalError):
            under_test.execute(test_input)

        verify(mocked_account_repository).get_by_id(mocked_unit_of_work, ...)
        verify(mocked_account_repository).update(mocked_unit_of_work, ...)

        verifyNoMoreInteractions(mocked_unit_of_work, mocked_account_repository)

    def test_should_fail_no_account_provided(self):
        from src.domain.accounts import Account, UpdateAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)

        under_test = UpdateAccount(DummyLogger(), mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

class TestGetAccount(DomainUnitTestsBase):

    def test_should_succeed_get_account(self):
        from src.domain.accounts import Account, GetAccount, AccountRepository

        account_result = Account(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ACCOUNT_PASSWORD
            , ACCOUNT_LANGUAGE
            , datetime.now()
            , datetime.now())

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ACCOUNT_ID).thenReturn(account_result)

        under_test = GetAccount(MockedLogger(), mocked_unit_of_work, mocked_account_repository)
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None, "Result cannot be empty."
        assert result == account_result, "Result differs from expected result"

    def test_should_succeed_get_account_no_result(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository).get_by_id(mocked_unit_of_work, ACCOUNT_ID).thenReturn(None)

        under_test = GetAccount(MockedLogger(), mocked_unit_of_work, mocked_account_repository)
        result = under_test.execute(ACCOUNT_ID)

        assert result is None, "Result should be empty"

    def test_should_fail_no_account_id(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)

        under_test = GetAccount(MockedLogger(), mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import GetAccount, AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository) \
            .get_by_id(mocked_unit_of_work, ACCOUNT_ID) \
            .thenRaise(InternalError("Something failed"))

        under_test = GetAccount(MockedLogger(), mocked_unit_of_work, mocked_account_repository)
        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_ID)


class TestGetAccountByEmail(DomainUnitTestsBase):

    def test_should_succeed(self):
        from src.domain.accounts import Account, ValidateAccountEmail, GetAccountByEmail, \
            AccountRepository

        repo_return = Account(ACCOUNT_ID, ACCOUNT_EMAIL, "", ACCOUNT_LANGUAGE, datetime.now(), datetime.now())

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_validate_email_br = mock(ValidateAccountEmail)
        when(mocked_validate_email_br) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(True)
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository) \
            .get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL) \
            .thenReturn(repo_return)

        under_test = GetAccountByEmail(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_account_repository
            , mocked_validate_email_br)
        result = under_test.execute(ACCOUNT_EMAIL)

        assert result is not None
        assert result.get_id() == ACCOUNT_ID
        assert result.email == ACCOUNT_EMAIL

        verify(mocked_validate_email_br).execute(ACCOUNT_EMAIL)
        verify(mocked_account_repository).get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_validate_email_br
            , mocked_account_repository)

    def test_should_succeed_unknown_email(self):
        from src.domain.accounts import ValidateAccountEmail, GetAccountByEmail, \
            AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_validate_email_br = mock(ValidateAccountEmail)
        when(mocked_validate_email_br) \
            .execute(ACCOUNT_EMAIL_UNKNOWN) \
            .thenReturn(True)
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository) \
            .get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL_UNKNOWN) \
            .thenReturn(None)

        under_test = GetAccountByEmail(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_account_repository
            , mocked_validate_email_br)
        result = under_test.execute(ACCOUNT_EMAIL_UNKNOWN)

        assert result is None

        verify(mocked_validate_email_br).execute(ACCOUNT_EMAIL_UNKNOWN)
        verify(mocked_account_repository).get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL_UNKNOWN)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_validate_email_br
            , mocked_account_repository)

    def test_should_fail_no_email(self):
        from src.domain.accounts import ValidateAccountEmail, GetAccountByEmail, \
            AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_validate_email_br = mock(ValidateAccountEmail)
        mocked_account_repository = mock(AccountRepository)

        under_test = GetAccountByEmail(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_account_repository
            , mocked_validate_email_br)

        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_validate_email_br
            , mocked_account_repository)

    def test_should_fail_invalid_email(self):
        from src.domain.accounts import ValidateAccountEmail, GetAccountByEmail, \
            AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_validate_email_br = mock(ValidateAccountEmail)
        when(mocked_validate_email_br) \
            .execute(ACCOUNT_EMAIL_INVALID) \
            .thenReturn(False)
        mocked_account_repository = mock(AccountRepository)

        under_test = GetAccountByEmail(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_account_repository
            , mocked_validate_email_br)

        with pytest.raises(AssertionError):
            under_test.execute(ACCOUNT_EMAIL_INVALID)

        verify(mocked_validate_email_br).execute(ACCOUNT_EMAIL_INVALID)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_validate_email_br
            , mocked_account_repository)

    def test_should_fail_repository_error(self):
        from src.domain.accounts import Account, ValidateAccountEmail, GetAccountByEmail, \
            AccountRepository

        mocked_unit_of_work = UnitOfWorkMockProvider.get()
        mocked_validate_email_br = mock(ValidateAccountEmail)
        when(mocked_validate_email_br) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(True)
        mocked_account_repository = mock(AccountRepository)
        when(mocked_account_repository) \
            .get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL) \
            .thenRaise(InternalError)

        under_test = GetAccountByEmail(
            MockedLogger()
            , mocked_unit_of_work
            , mocked_account_repository
            , mocked_validate_email_br)
        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_EMAIL)

        verify(mocked_validate_email_br).execute(ACCOUNT_EMAIL)
        verify(mocked_account_repository).get_by_email(mocked_unit_of_work, ACCOUNT_EMAIL)

        verifyNoMoreInteractions(
            mocked_unit_of_work
            , mocked_validate_email_br
            , mocked_account_repository)


class TestValidateAccountEmail(DomainUnitTestsBase):
    VALID_EMAIL = "test.mail@some.net"
    INVALID_EMAIL = "test-mail@some.net"
    NOT_AN_EMAIL = "test.user27718"

    def test_should_succeed_valid_email(self):
        from src.domain.accounts import ValidateAccountEmail

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        under_test = ValidateAccountEmail(DummyLogger(), mocked_unit_of_work)
        under_test.execute(self.VALID_EMAIL)

        verifyNoMoreInteractions(mocked_unit_of_work)

    def test_should_fail_invalid_email(self):
        from src.domain.accounts import ValidateAccountEmail

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        under_test = ValidateAccountEmail(DummyLogger(), mocked_unit_of_work)
        under_test.execute(self.INVALID_EMAIL)

        verifyNoMoreInteractions(mocked_unit_of_work)

    def test_should_fail_not_an_email(self):
        from src.domain.accounts import ValidateAccountEmail

        mocked_unit_of_work = UnitOfWorkMockProvider.get()

        under_test = ValidateAccountEmail(DummyLogger(), mocked_unit_of_work)
        under_test.execute(self.NOT_AN_EMAIL)

        verifyNoMoreInteractions(mocked_unit_of_work)
