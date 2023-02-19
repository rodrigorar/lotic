from src.application import UnitOfWorkProvider, UseCase
from src.domain.auth import AuthToken, Login, Principal
from src.domain.auth.businessrules import AuthBusinessRulesProvider


class UseCaseAuthenticate(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , auth_br_provider: AuthBusinessRulesProvider):

        self.unit_of_work_provider = unit_of_work_provider
        self.auth_br_provider = auth_br_provider

    def execute(self, principal: Principal) -> AuthToken:
        assert principal is not None, "Principal cannot be null"

        with self.unit_of_work_provider.get() as unit_of_work:
            login_br = self.auth_br_provider.login(unit_of_work)
            return login_br.execute(principal)

