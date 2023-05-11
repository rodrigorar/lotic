import uuid

from logging import Logger

from src.application import UseCase, UnitOfWorkProvider
from src.application.accounts import AccountDTO
from src.application.errors import AuthorizationError
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain import InvalidArgumentError
from src.application.auth.shared import AuthorizationContext, EncryptionEngine


class UseCaseCreateAccount(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider
            , encryption_engine: EncryptionEngine):

        self.unit_of_work_provider = unit_of_work_provider
        self.account_br_provider = account_business_rules_provider
        self.encryption_engine = encryption_engine
        self.logger = logger

    def execute(self, account: AccountDTO):
        self.logger.info("Executing ---> UseCase[CreateAccount]")

        assert account is not None, "Account cannot be empty"

        with self.unit_of_work_provider.get() as unit_of_work:
            validate_email_br = self.account_br_provider.validate_account_email(unit_of_work)
            if not validate_email_br.execute(account.email):
                raise InvalidArgumentError("Email provided is not valid")

            create_account_br = self.account_br_provider.create_account(unit_of_work)
            account.password = self.encryption_engine.encrypt(account.password)
            result = create_account_br.execute(account.to_entity())
        return result


class UseCaseGetAccount(UseCase):

    def __init__(
            self
            , logger: Logger
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider):

        self.logger = logger
        self.unit_of_work_provider = unit_of_work_provider
        self.account_business_rules_provider = account_business_rules_provider

    def execute(self, account_id: uuid) -> AccountDTO:
        self.logger.info("Executing ---> UseCase[GetAccount]")

        assert account_id is not None, "Account id cannot be empty"

        if not AuthorizationContext.is_matching_account(account_id):
            raise AuthorizationError('Invalid authorization token provided')

        with self.unit_of_work_provider.get() as unit_of_work:
            business_rule = self.account_business_rules_provider.get_account(unit_of_work)
            result = business_rule.execute(account_id)
        return AccountDTO.from_entity(result) if result is not None else None
