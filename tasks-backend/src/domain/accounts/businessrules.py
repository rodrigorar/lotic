import uuid

from src.domain import BaseBusinessRule
from src.domain.accounts import AccountRepository, Account


class CreateAccount(BaseBusinessRule):

    def __init__(self, unit_of_work, account_repository: AccountRepository):
        super().__init__(unit_of_work)
        self.account_repository = account_repository

    def execute(self, account: Account):
        assert account is not None, "Account cannot be empty"
        return self.account_repository.insert(self.unit_of_work, account)


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
    def get_account(unit_of_work) -> GetAccount:
        raise NotImplemented("AccountBusinessRulesProvider#get_account is not implemented.")
