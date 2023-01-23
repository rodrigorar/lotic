import re
import uuid

from src.domain import BaseBusinessRule
from src.domain.accounts import AccountRepository, Account
from src.domain.errors import InvalidArgumentError


class CreateAccount(BaseBusinessRule):

    def __init__(self, unit_of_work, account_repository: AccountRepository):
        super().__init__(unit_of_work)
        self.account_repository = account_repository

    def execute(self, account: Account):
        assert account is not None, "Account cannot be empty"
        return self.account_repository.insert(self.unit_of_work, account)


class ValidateAccountEmail(BaseBusinessRule):

    def __init__(self, unit_of_work):
        super().__init__(unit_of_work)

    def execute(self, email: str):
        email_pattern = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9\-\.\_\+]{0,61}[a-zA-Z0-9]@[a-zA-Z0.9\-\.]*\.[a-z]*")
        return re.fullmatch(email_pattern, email)


class GetAccount(BaseBusinessRule):

    def __init__(self, unit_of_work, account_repository: AccountRepository):
        super().__init__(unit_of_work)
        self.account_repository = account_repository

    def execute(self, account_id: uuid):
        assert account_id is not None, "Account id cannot be empty"
        return self.account_repository.get_by_id(self.unit_of_work, account_id)


class AccountBusinessRulesProvider:

    @staticmethod
    def create_account(unit_of_work) -> CreateAccount:
        raise NotImplemented("AccountBusinessRulesProvider#created_account is not implemented.")

    @staticmethod
    def validate_account_email(unit_of_work) -> ValidateAccountEmail:
        raise NotImplemented("AccountBusinessRulesProvider#validate_account_email is not implemented.")

    @staticmethod
    def get_account(unit_of_work) -> GetAccount:
        raise NotImplemented("AccountBusinessRulesProvider#get_account is not implemented.")
