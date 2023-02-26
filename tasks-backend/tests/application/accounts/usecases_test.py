from datetime import datetime
from unittest.mock import MagicMock, patch
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import InternalError, InvalidArgumentError, DatabaseProvider
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.domain.accounts import Account, CreateAccount, ValidateAccountEmail, GetAccount, AccountBusinessRulesProvider
from tests.application.shared import ApplicationUnitTestsBase, MockedUnitOfWorkProvider, MockedLogger
from src.application.auth import AuthorizationContext

global create_account_br
global validate_account_email_br
global get_account_br


class MockedAccountBusinessRulesProvider(AccountBusinessRulesProvider):

    @staticmethod
    def create_account(unit_of_work):
        return create_account_br

    @staticmethod
    def validate_account_email(unit_of_work):
        return validate_account_email_br

    @staticmethod
    def get_account(unit_of_work):
        return get_account_br


ACCOUNT_ID = uuid4()
UNKNOWN_ACCOUNT_ID = uuid4()
ACCOUNT_EMAIL = "john.doe@mail.not"
ACCOUNT_PASSWORD = "passwd01"
ACCOUNT_ENCRYPTED_PASSWORD = "uiskjdiuytrn4"


class TestUseCaseCreateAccount:

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_account_br
        global validate_account_email_br
        global get_account_br

        create_account_br = mock(CreateAccount)
        validate_account_email_br = mock(ValidateAccountEmail)
        get_account_br = mock(GetAccount)
        yield
        create_account_br = None
        validate_account_email_br = None
        get_account_br = None

    def test_should_succeed(self):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO
        from src.application.auth import EncryptionEngine

        input_value = AccountDTO(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(validate_account_email_br).execute(ACCOUNT_EMAIL).thenReturn(True)
        when(create_account_br).execute(...).thenReturn(ACCOUNT_ID)

        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .encrypt(...) \
            .thenReturn(ACCOUNT_ENCRYPTED_PASSWORD)

        under_test = UseCaseCreateAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , mocked_encryption_engine
            , MockedLogger())
        result = under_test.execute(input_value)

        assert result is not None, "Result cannot be None"
        assert result == ACCOUNT_ID, "Result differs from expected"

        verify(validate_account_email_br).execute(ACCOUNT_EMAIL)
        verify(create_account_br).execute(...)
        verify(mocked_encryption_engine).encrypt(...)

        verifyNoMoreInteractions(
            validate_account_email_br
            , create_account_br
            , mocked_encryption_engine)

    def test_should_fail_none_input(self):
        from src.application.accounts import UseCaseCreateAccount

        under_test = UseCaseCreateAccount(None, None, None, MockedLogger())
        with pytest.raises(AssertionError):
            under_test.execute(None)

    # br = business_rule
    def test_should_fail_create_account_br_error(self):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO
        from src.application.auth import EncryptionEngine

        input_value = AccountDTO(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(validate_account_email_br).execute(ACCOUNT_EMAIL).thenReturn(True)
        when(create_account_br).execute(...).thenRaise(InternalError("Something went wrong"))

        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .encrypt(...) \
            .thenReturn(ACCOUNT_ENCRYPTED_PASSWORD)

        under_test = UseCaseCreateAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , mocked_encryption_engine
            , MockedLogger())
        with pytest.raises(InternalError):
            under_test.execute(input_value)

        verify(validate_account_email_br).execute(ACCOUNT_EMAIL)
        verify(create_account_br).execute(...)
        verify(mocked_encryption_engine).encrypt(...)

        verifyNoMoreInteractions(
            validate_account_email_br
            , create_account_br
            , mocked_encryption_engine)

    def test_should_fail_validate_account_email_br_error(self):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO
        from src.application.auth import EncryptionEngine

        input_value = AccountDTO(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(validate_account_email_br).execute(ACCOUNT_EMAIL).thenReturn(False)

        mocked_encryption_engine = mock(EncryptionEngine)

        under_test = UseCaseCreateAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , mocked_encryption_engine
            , MockedLogger())
        with pytest.raises(InvalidArgumentError):
            under_test.execute(input_value)

        verify(validate_account_email_br).execute(ACCOUNT_EMAIL)

        verifyNoMoreInteractions(
            validate_account_email_br
            , mocked_encryption_engine)

    def test_should_fail_dto_to_entity_error(self, setup_mocks_aspect):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO
        from src.application.auth import EncryptionEngine

        input_value = AccountDTO(None, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(validate_account_email_br).execute(ACCOUNT_EMAIL).thenReturn(True)
        when(create_account_br).execute(...)  # Will throw error, no need to configure a behaviour

        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .encrypt(...) \
            .thenReturn(ACCOUNT_ENCRYPTED_PASSWORD)

        under_test = UseCaseCreateAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , mocked_encryption_engine
            , MockedLogger())
        with pytest.raises(AssertionError):
            under_test.execute(input_value)

        verify(validate_account_email_br).execute(ACCOUNT_EMAIL)
        verify(mocked_encryption_engine).encrypt(...)

        verifyNoMoreInteractions(
            validate_account_email_br
            , create_account_br
            , mocked_encryption_engine)


# TODO: Should test authorization code as well, not only the happy path
class TestUseCaseGetAccount(ApplicationUnitTestsBase):

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_account_br
        global get_account_br

        create_account_br = mock(CreateAccount)
        get_account_br = mock(GetAccount)
        yield
        create_account_br = None
        get_account_br = None

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_with_result(self):
        from src.application.accounts import UseCaseGetAccount, AccountDTO

        result_value = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(result_value)

        under_test = UseCaseGetAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , MockedLogger())
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None, "Result cannot be None"

        assert result.equals(AccountDTO.from_entity(result_value)), "Not the expected account"

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_succeed_with_no_result(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(UNKNOWN_ACCOUNT_ID).thenReturn(None)

        under_test = UseCaseGetAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , MockedLogger())
        result = under_test.execute(UNKNOWN_ACCOUNT_ID)

        assert result is None, "Result cannot be None"

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_get_account_br_failure(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(ACCOUNT_ID).thenRaise(InternalError("Something went wrong"))

        under_test = UseCaseGetAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , MockedLogger())
        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_ID)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_no_account_id(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(None)

        under_test = UseCaseGetAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , MockedLogger())
        with pytest.raises(AssertionError):
            under_test.execute(None)

    @patch.object(AuthorizationContext, 'is_matching_account', MagicMock(return_value=True))
    def test_should_fail_entity_to_dto_error(self):
        from src.application.accounts import UseCaseGetAccount

        result_value = Account(ACCOUNT_ID, None, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(result_value)

        under_test = UseCaseGetAccount(
            MockedUnitOfWorkProvider()
            , MockedAccountBusinessRulesProvider()
            , MockedLogger())
        with pytest.raises(AssertionError):
            under_test.execute(ACCOUNT_ID)
