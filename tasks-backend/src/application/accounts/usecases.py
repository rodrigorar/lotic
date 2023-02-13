import uuid

from logging import Logger

from src.application import UseCase, UnitOfWorkProvider
from src.application.accounts import AccountDTO
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain.errors import InvalidArgumentError


class UseCaseCreateAccount(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.account_br_provider = account_business_rules_provider
        self.logger = logger

    def execute(self, account: AccountDTO):
        assert account is not None, "User cannot be empty"

        self.logger.info("UseCase[CreateAccount](" + str(account.id) + ")")

        with self.unit_of_work_provider.get() as unit_of_work:
            validate_email_br = self.account_br_provider.validate_account_email(unit_of_work)
            if not validate_email_br.execute(account.email):
                raise InvalidArgumentError("Email is not valid")

            create_account_br = self.account_br_provider.create_account(unit_of_work)
            result = create_account_br.execute(account.to_entity())
        return result


class UseCaseGetAccount(UseCase):

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider
            , logger: Logger):

        self.unit_of_work_provider = unit_of_work_provider
        self.account_business_rules_provider = account_business_rules_provider
        self.logger = logger

    def execute(self, account_id: uuid):
        assert account_id is not None, "Account id cannot be empty"

        self.logger.info("UseCase[GetAccount](" + str(account_id) + ")")

        with self.unit_of_work_provider.get() as unit_of_work:
            business_rule = self.account_business_rules_provider.get_account(unit_of_work)
            result = business_rule.execute(account_id)
        return AccountDTO.from_entity(result) if result is not None else None
