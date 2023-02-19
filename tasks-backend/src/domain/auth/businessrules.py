from datetime import datetime, timedelta
from uuid import uuid4

from src.domain import BaseBusinessRule, NotFoundError
from src.domain.accounts import GetAccountByEmail
from src.domain.auth.models import AuthSession, AuthToken, Principal
from src.domain.auth.repositories import AuthSessionRepository
from src.domain.errors import LoginFailedError
from src.domain.auth.shared import EncryptionEngine


class Login(BaseBusinessRule):

    def __init__(
            self
            , unit_of_work
            , get_account_by_email_br: GetAccountByEmail
            , auth_session_repository: AuthSessionRepository
            , encryption_engine: EncryptionEngine):

        super().__init__(unit_of_work)
        self.get_account_by_email_br = get_account_by_email_br
        self.auth_session_repository = auth_session_repository
        self.encryption_engine = encryption_engine

    def execute(self, principal: Principal) -> AuthToken:
        assert principal is not None, "Principal cannot be null"

        account = self.get_account_by_email_br.execute(principal.subject)
        if account is None:
            raise NotFoundError("No account found for subject")

        if not self.encryption_engine.check(account.password, principal.secret):
            raise LoginFailedError("Wrong secret")

        auth_session = self.auth_session_repository.get_by_account_id(self.unit_of_work, account.get_id())
        if auth_session is None:
            current_time = datetime.now()
            auth_session = AuthSession(
                uuid4()
                , account.get_id()
                , current_time
                , current_time + timedelta(hours=1))
            self.auth_session_repository.insert(self.unit_of_work, auth_session)

        return AuthToken(auth_session.id, account.id)


class AuthBusinessRulesProvider:

    @staticmethod
    def login(unit_of_work) -> Login:
        raise NotImplementedError("AuthBusinessRulesProvider#login not implemented")
