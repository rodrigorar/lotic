from datetime import datetime, timedelta
import uuid
from uuid import uuid4

from src.application import UnitOfWorkProvider, UseCase
from src.application.auth.models import AuthSession, AuthToken, Principal
from src.application.auth.providers import AuthTokenStorage
from src.application.auth.shared import EncryptionEngine
from src.domain import NotFoundError
from src.domain.accounts import AccountBusinessRulesProvider
from src.application.errors import LoginFailedError


class UseCaseLogin(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , account_br_provider: AccountBusinessRulesProvider
            , auth_token_storage: AuthTokenStorage
            , encryption_engine: EncryptionEngine):

        self.unit_of_work_provider = unit_of_work_provider
        self.account_br_provider = account_br_provider
        self.auth_token_storage = auth_token_storage
        self.encryption_engine = encryption_engine

    def execute(self, principal: Principal) -> AuthToken:
        assert principal is not None, "Principal cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            assert principal is not None, "Principal cannot be null"

            account_by_email_br = self.account_br_provider.get_account_by_email(unit_of_work)
            account = account_by_email_br.execute(principal.subject)
            if account is None:
                raise NotFoundError("No account found for subject")

            if not self.encryption_engine.check(account.password, principal.secret):
                raise LoginFailedError("Wrong secret")

            auth_session = self.auth_token_storage.find_by_account_id(unit_of_work, account.get_id())
            if auth_session is None:
                self.auth_token_storage.remove_all_for_account_id(unit_of_work, account.get_id())

                current_time = datetime.now()
                auth_session = AuthSession(
                    uuid4()
                    , str(uuid4())
                    , account.get_id()
                    , current_time
                    , current_time + timedelta(hours=1))
                self.auth_token_storage.store(unit_of_work, auth_session)

            return AuthToken(
                auth_session.id
                , auth_session.refresh_token
                , account.get_id()
                , auth_session.expires_at)


class UseCaseRefresh(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , auth_token_storage: AuthTokenStorage):

        self.unit_of_work_provider = unit_of_work_provider
        self.auth_token_storage = auth_token_storage

    def execute(self, refresh_token: uuid):
        assert refresh_token is not None, "No refresh token provided"

        with self.unit_of_work_provider.get() as unit_of_work:
            current_auth_session = self.auth_token_storage.find_by_refresh_token(unit_of_work, str(refresh_token))
            if current_auth_session is None:
                raise NotFoundError("No auth session found for refresh token: " + str(refresh_token))

            self.auth_token_storage.remove_all_for_account_id(
                unit_of_work
                , current_auth_session.get_account_id())

            current_time = datetime.now()
            new_auth_session = AuthSession(
                uuid4()
                , str(uuid4())
                , current_auth_session.get_account_id()
                , current_time
                , current_time + timedelta(hours=1))
            self.auth_token_storage.store(unit_of_work, new_auth_session)

            return AuthToken(
                new_auth_session.id
                , new_auth_session.refresh_token
                , new_auth_session.get_account_id()
                , new_auth_session.expires_at)
