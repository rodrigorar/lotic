import uuid

from src.application import UseCase, UnitOfWorkProvider
from src.application.accounts import AccountDTO
from src.domain.accounts import AccountBusinessRulesProvider
from src.domain.errors import InvalidArgumentError


class UseCaseCreateAccount(UseCase):
    __unit_of_work_provider = None
    __account_br_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider):

        self.__unit_of_work_provider = unit_of_work_provider
        self.__account_br_provider = account_business_rules_provider

    def execute(self, account: AccountDTO):
        assert account is not None, "User cannot be empty"

        with self.__unit_of_work_provider.get() as unit_of_work:
            validate_email_br = self.__account_br_provider.validate_account_email(unit_of_work)
            if not validate_email_br.execute(account.email):
                raise InvalidArgumentError("Email is not valid")

            create_account_br = self.__account_br_provider.create_account(unit_of_work)
            result = create_account_br.execute(account.to_entity())
        return result


class UseCaseGetAccount(UseCase):
    __unit_of_work_provider = None
    __account_business_rules_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , account_business_rules_provider: AccountBusinessRulesProvider):

        self.__unit_of_work_provider = unit_of_work_provider
        self.__account_business_rules_provider = account_business_rules_provider

    def execute(self, account_id: uuid):
        assert account_id is not None, "Account id cannot be empty"

        with self.__unit_of_work_provider.get() as unit_of_work:
            business_rule = self.__account_business_rules_provider.get_account(unit_of_work)
            result = business_rule.execute(account_id)
        return AccountDTO.from_entity(result) if result is not None else None
