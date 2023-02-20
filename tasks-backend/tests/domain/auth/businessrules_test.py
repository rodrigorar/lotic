from datetime import datetime, timedelta
from uuid import uuid4

from mockito import mock, verify, verifyNoMoreInteractions, when
import pytest

from src.domain import NotFoundError
from src.domain.errors import LoginFailedError
from tests.application.shared import MockedUnitOfWorkProvider
from tests.domain.shared import DomainUnitTestsBase

ACCOUNT_ID = uuid4()
ACCOUNT_EMAIL = "test.account@mail.not"
ACCOUNT_PASSWORD = "qwerty"
ACCOUNT_PASSWORD_INVALID = "123456"
ENCRYPTED_PASSWORD = "testencryptedpassword"


class TestLogin(DomainUnitTestsBase):

    def test_should_succeed_login(self):
        from src.domain.accounts import GetAccountByEmail, Account
        from src.domain.auth import EncryptionEngine
        from src.domain.auth.models import Principal
        from src.domain.auth.repositories import AuthSessionRepository
        from src.domain.auth.businessrules import Login

        account = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ENCRYPTED_PASSWORD, datetime.now(), datetime.now())

        dummy_unit_of_work = MockedUnitOfWorkProvider.get()
        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)
        mocked_auth_session_repository = mock(AuthSessionRepository)
        when(mocked_auth_session_repository) \
            .get_by_account_id(dummy_unit_of_work, ACCOUNT_ID) \
            .thenReturn(None)
        when(mocked_auth_session_repository) \
            .insert(dummy_unit_of_work, ...)
        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(True)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = Login(
            dummy_unit_of_work
            , mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        result = under_test.execute(principal)

        assert result is not None
        assert result.token is not None
        assert result.account_id == ACCOUNT_ID

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_auth_session_repository).get_by_account_id(dummy_unit_of_work, ACCOUNT_ID)
        verify(mocked_auth_session_repository).insert(...)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)

    def test_should_succeed_already_logged_in(self):
        from src.domain.accounts import GetAccountByEmail, Account
        from src.domain.auth import EncryptionEngine
        from src.domain.auth.models import Principal, AuthSession
        from src.domain.auth.repositories import AuthSessionRepository
        from src.domain.auth.businessrules import Login

        account = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ENCRYPTED_PASSWORD, datetime.now(), datetime.now())
        auth_session = AuthSession(uuid4(), ACCOUNT_ID, datetime.now(), datetime.now() + timedelta(hours=1))

        dummy_unit_of_work = MockedUnitOfWorkProvider.get()
        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)
        mocked_auth_session_repository = mock(AuthSessionRepository)
        when(mocked_auth_session_repository) \
            .get_by_account_id(dummy_unit_of_work, ACCOUNT_ID) \
            .thenReturn(auth_session)
        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(True)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = Login(
            dummy_unit_of_work
            , mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        result = under_test.execute(principal)

        assert result is not None
        assert result.token == auth_session.id
        assert result.account_id == auth_session.get_account_id()

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_auth_session_repository).get_by_account_id(dummy_unit_of_work, ACCOUNT_ID)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_auth_session_repository)

    def test_should_fail_no_principal(self):
        from src.domain.accounts import GetAccountByEmail
        from src.domain.auth import EncryptionEngine
        from src.domain.auth.repositories import AuthSessionRepository
        from src.domain.auth.businessrules import Login

        dummy_unit_of_work = MockedUnitOfWorkProvider.get()
        mocked_get_account_by_email = mock(GetAccountByEmail)
        mocked_auth_session_repository = mock(AuthSessionRepository)
        mocked_encryption_engine = mock(EncryptionEngine)

        under_test = Login(
            dummy_unit_of_work
            , mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        with pytest.raises(AssertionError):
            under_test.execute(None)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_auth_session_repository)

    def test_should_fail_unknown_account(self):
        from src.domain.accounts import GetAccountByEmail
        from src.domain.auth import EncryptionEngine
        from src.domain.auth.models import Principal
        from src.domain.auth.repositories import AuthSessionRepository
        from src.domain.auth.businessrules import Login

        dummy_unit_of_work = MockedUnitOfWorkProvider.get()
        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(None)
        mocked_auth_session_repository = mock(AuthSessionRepository)
        mocked_encryption_engine = mock(EncryptionEngine)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = Login(
            dummy_unit_of_work
            , mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)
        with pytest.raises(NotFoundError):
            under_test.execute(principal)

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_auth_session_repository)

    def test_should_fail_wrong_password(self):
        from src.domain.accounts import GetAccountByEmail, Account
        from src.domain.auth import EncryptionEngine
        from src.domain.auth.models import Principal
        from src.domain.auth.repositories import AuthSessionRepository
        from src.domain.auth.businessrules import Login

        account = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ENCRYPTED_PASSWORD, datetime.now(), datetime.now())

        dummy_unit_of_work = MockedUnitOfWorkProvider.get()
        mocked_get_account_by_email = mock(GetAccountByEmail)
        when(mocked_get_account_by_email) \
            .execute(ACCOUNT_EMAIL) \
            .thenReturn(account)
        mocked_auth_session_repository = mock(AuthSessionRepository)
        mocked_encryption_engine = mock(EncryptionEngine)
        when(mocked_encryption_engine) \
            .check(...) \
            .thenReturn(False)

        principal = Principal(ACCOUNT_EMAIL, ACCOUNT_PASSWORD)
        under_test = Login(
            dummy_unit_of_work
            , mocked_get_account_by_email
            , mocked_auth_session_repository
            , mocked_encryption_engine)

        with pytest.raises(LoginFailedError):
            under_test.execute(principal)

        verify(mocked_get_account_by_email).execute(ACCOUNT_EMAIL)
        verify(mocked_encryption_engine).check(...)

        verifyNoMoreInteractions(
            mocked_encryption_engine
            , mocked_get_account_by_email
            , mocked_auth_session_repository)
