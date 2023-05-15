from datetime import datetime, timedelta
from enum import Enum
import inspect
from logging import Logger
import uuid
from uuid import uuid4
import warnings

from src.application import UnitOfWorkProvider, UseCase
from src.application.auth.configurations import AuthTokenTTLConfigs
from src.application.auth.models import AuthSession, AuthToken, Principal
from src.application.auth.providers import AuthTokenStorage
from src.application.auth.shared import AuthorizationContext, EncryptionEngine
from src.domain import InternalError, LogProvider, NotFoundError
from src.domain.accounts import AccountBusinessRulesProvider
from src.application.errors import AuthorizationError, InvalidAuthorizationError, LoginFailedError


class AuthError:
    class Cause(Enum):
        GENERIC_ERROR = 1
        INVALID_AUTHORIZATION = 2

    def __init__(self, cause: Cause, message: str):
        self.cause = cause
        self.message = message

    def raise_exception(self):

        match self.cause:
            case AuthError.Cause.INVALID_AUTHORIZATION:
                raise InvalidAuthorizationError(self.message)
            case AuthError.Cause.GENERIC_ERROR:
                raise InternalError(self.message)
            case _:
                raise InternalError()


class UseCaseLogin(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , account_br_provider: AccountBusinessRulesProvider
            , auth_token_storage: AuthTokenStorage
            , encryption_engine: EncryptionEngine
            , auth_tokens_ttls: AuthTokenTTLConfigs):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.account_br_provider = account_br_provider
        self.auth_token_storage = auth_token_storage
        self.encryption_engine = encryption_engine
        self.auth_token_ttls = auth_tokens_ttls

    def execute(self, principal: Principal) -> AuthToken:
        self.logger.info("Executing ---> UseCase[Login]")

        assert principal is not None, "Principal cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            account_by_email_br = self.account_br_provider.get_account_by_email(unit_of_work)
            account = account_by_email_br.execute(principal.subject)
            if account is None:
                raise NotFoundError("No account found for subject")

            if not self.encryption_engine.check(account.password, principal.secret):
                raise LoginFailedError("Wrong secret")

            current_time = datetime.now()
            auth_session = AuthSession(
                uuid4()
                , str(uuid4())
                , account.get_id()
                , current_time
                , current_time + timedelta(hours=self.auth_token_ttls.get_access_token_ttl())
                , current_time + timedelta(days=self.auth_token_ttls.get_refresh_token_ttl()))
            self.auth_token_storage.store(unit_of_work, auth_session)

            return AuthToken(
                auth_session.id
                , auth_session.refresh_token
                , account.get_id()
                , auth_session.expires_at)


class UseCaseRefresh(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , auth_token_storage: AuthTokenStorage
            , auth_tokens_ttl_configs: AuthTokenTTLConfigs):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.auth_token_storage = auth_token_storage
        self.auth_tokens_ttl_configs = auth_tokens_ttl_configs

    @staticmethod
    def can_refresh(auth_session) -> bool:
        return not (auth_session is None or auth_session.is_refresh_expired())

    def execute(self, refresh_token: uuid) -> AuthToken:
        self.logger.info("Executing ---> UseCase[Refresh]")

        assert refresh_token is not None, "No refresh token provided"

        error = None

        with self.unit_of_work_provider.get() as unit_of_work:
            current_auth_session = self.auth_token_storage.find_by_refresh_token(unit_of_work, str(refresh_token))

            if self.can_refresh(current_auth_session):
                current_time = datetime.now()
                new_auth_session = AuthSession(
                    uuid4()
                    , str(uuid4())
                    , current_auth_session.get_account_id()
                    , current_time
                    , current_time + timedelta(hours=self.auth_tokens_ttl_configs.get_access_token_ttl())
                    , current_time + timedelta(days=self.auth_tokens_ttl_configs.get_refresh_token_ttl()))
                self.auth_token_storage.store(unit_of_work, new_auth_session)
                self.auth_token_storage.remove(unit_of_work, current_auth_session.get_id())
            else:
                if current_auth_session is not None:
                    self.auth_token_storage.remove(unit_of_work, current_auth_session.get_id())
                error = AuthError(AuthError.Cause.INVALID_AUTHORIZATION, "Refresh token not valid")

        if error is not None:
            error.raise_exception()

        return AuthToken(
            new_auth_session.id
            , new_auth_session.refresh_token
            , new_auth_session.get_account_id()
            , new_auth_session.expires_at)


class UseCaseLogoutSession(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , auth_token_storage: AuthTokenStorage):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.auth_token_storage = auth_token_storage

    def execute(self, access_token: uuid):
        self.logger.info("Executing ---> UseCase[LogoutSession]")

        assert access_token is not None, "Access Token cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            auth_session = self.auth_token_storage.find_by_id(unit_of_work, access_token)
            if auth_session is None:
                raise NotFoundError("No auth session for " + access_token)
            elif not AuthorizationContext.is_matching_account(auth_session.account_id):
                raise AuthorizationError("Non authorized operation for ")
            self.auth_token_storage.remove(unit_of_work, access_token)


class UseCaseLogout(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , auth_token_storage: AuthTokenStorage):
        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.auth_token_storage = auth_token_storage

    def execute(self, account_id: uuid) -> None:
        self.logger.info("Executing ---> UseCase[Logout]")

        assert account_id is not None, "Account id cannot be null"

        if not AuthorizationContext.is_matching_account(account_id):
            raise AuthorizationError("Unauthorized operation")

        with self.unit_of_work_provider.get() as unit_of_work:
            self.auth_token_storage.remove_all_for_account_id(unit_of_work, account_id)