from datetime import datetime, timedelta
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import DatabaseProvider, NotFoundError
from src.domain.errors import LoginFailedError
from tests.application.shared import MockedUnitOfWorkProvider
from tests.shared import MockDatabase

ACCOUNT_ID = uuid4()
ACCOUNT_EMAIL = "test.account@mail.not"
ACCOUNT_PASSWORD = "qwerty"
ACCOUNT_PASSWORD_INVALID = "123456"
ENCRYPTED_PASSWORD = "testencryptedpassword"


class TestUseCaseLogin:

    @pytest.fixture(autouse=True)
    def database_provider_aspect(self):
        DatabaseProvider().set_database(MockDatabase())
        yield
        DatabaseProvider().set_database(None)

    def test_should_succeed_login(self):
        from src.domain.accounts import AccountBusinessRulesProvider, GetAccountByEmail, Account
        from src.application.auth import EncryptionEngine, AuthTokenStorage, UseCaseLogin
        from src.application.auth.models import Principal

        account = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ENCRYPTED_PASSWORD, datetime.now(), datetime.now())

        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)

        mocked_account_br_provider = mock(AccountBusinessRulesProvider)
        when(mocked_account_br_provider) \
            .get_account_by_email(...) \
            .thenReturn(mocked_get_account_by_email)
        mocked_auth_token_storage = mock(AuthTokenStorage)
        when(mocked_auth_token_storage) \
            .find_by_account_id(...) \
            .thenReturn(None)
        when(mocked_auth_token_storage) \
            .remove_all_for_account_id(...)
        when(mocked_auth_token_storage) \
            .store(...)

        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(True)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = UseCaseLogin(
            MockedUnitOfWorkProvider()
            , mocked_account_br_provider
            , mocked_auth_token_storage
            , mocked_encryption_engine)
        result = under_test.execute(principal)

        assert result is not None
        assert result.token is not None
        assert result.account_id == ACCOUNT_ID

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_account_br_provider).get_account_by_email(...)
        verify(mocked_auth_token_storage).find_by_account_id(...)
        verify(mocked_auth_token_storage).remove_all_for_account_id(...)
        verify(mocked_auth_token_storage).store(...)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_get_account_by_email
            , mocked_account_br_provider
            , mocked_auth_token_storage
            , mocked_encryption_engine)

    def test_should_succeed_already_logged_in(self):
        from src.domain.accounts import AccountBusinessRulesProvider, GetAccountByEmail, Account
        from src.application.auth import EncryptionEngine, Principal, AuthSession, AuthTokenStorage, UseCaseLogin

        account = Account(
            ACCOUNT_ID
            , ACCOUNT_EMAIL
            , ENCRYPTED_PASSWORD
            , datetime.now()
            , datetime.now())
        auth_session = AuthSession(
            uuid4()
            , str(uuid4())
            , ACCOUNT_ID
            , datetime.now()
            , datetime.now() + timedelta(hours=1))

        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)
        mocked_account_br_provider = mock(AccountBusinessRulesProvider)
        when(mocked_account_br_provider) \
            .get_account_by_email(...) \
            .thenReturn(mocked_get_account_by_email)

        mocked_auth_session_repository = mock(AuthTokenStorage)
        when(mocked_auth_session_repository) \
            .find_by_account_id(...) \
            .thenReturn(auth_session)
        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(True)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = UseCaseLogin(
            MockedUnitOfWorkProvider()
            , mocked_account_br_provider
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        result = under_test.execute(principal)

        assert result is not None
        assert result.token == auth_session.id
        assert result.account_id == auth_session.get_account_id()

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_auth_session_repository).find_by_account_id(...)
        verify(mocked_account_br_provider).get_account_by_email(...)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_account_br_provider
            , mocked_auth_session_repository)

    def test_should_fail_no_principal(self):
        from src.domain.accounts import AccountBusinessRulesProvider
        from src.application.auth import EncryptionEngine, AuthTokenStorage, UseCaseLogin

        mocked_account_br_provider = mock(AccountBusinessRulesProvider)
        mocked_auth_session_repository = mock(AuthTokenStorage)
        mocked_encryption_engine = mock(EncryptionEngine)

        under_test = UseCaseLogin(
            MockedUnitOfWorkProvider()
            , mocked_account_br_provider
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_account_br_provider
            , mocked_auth_session_repository)

    def test_should_fail_unknown_account(self):
        from src.domain.accounts import AccountBusinessRulesProvider, GetAccountByEmail
        from src.application.auth import EncryptionEngine, Principal, AuthTokenStorage, UseCaseLogin

        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(None)
        mocked_account_br_provider = mock(AccountBusinessRulesProvider)
        when(mocked_account_br_provider) \
            .get_account_by_email(...) \
            .thenReturn(mocked_get_account_by_email)

        mocked_auth_session_repository = mock(AuthTokenStorage)
        mocked_encryption_engine = mock(EncryptionEngine)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = UseCaseLogin(
            MockedUnitOfWorkProvider()
            , mocked_account_br_provider
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        with pytest.raises(NotFoundError):
            under_test.execute(principal)

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_account_br_provider).get_account_by_email(...)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_account_br_provider
            , mocked_auth_session_repository)

    def test_should_fail_wrong_password(self):
        from src.domain.accounts import AccountBusinessRulesProvider, GetAccountByEmail, Account
        from src.application.auth import EncryptionEngine, Principal, AuthTokenStorage, UseCaseLogin

        account = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ENCRYPTED_PASSWORD, datetime.now(), datetime.now())

        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)
        mocked_account_br_provider = mock(AccountBusinessRulesProvider)
        when(mocked_account_br_provider) \
            .get_account_by_email(...) \
            .thenReturn(mocked_get_account_by_email)

        mocked_auth_session_repository = mock(AuthTokenStorage)
        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(False)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = UseCaseLogin(
            MockedUnitOfWorkProvider()
            , mocked_account_br_provider
            , mocked_auth_session_repository
            , mocked_encryption_engine)

        with pytest.raises(LoginFailedError):
            under_test.execute(principal)

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_account_br_provider).get_account_by_email(...)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_account_br_provider
            , mocked_auth_session_repository)
