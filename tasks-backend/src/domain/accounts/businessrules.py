from logging import Logger
import re
from typing import Optional
import uuid

from src.domain import BaseBusinessRule
from src.domain.accounts import AccountRepository, Account


class CreateAccount(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , account_repository: AccountRepository):

        super().__init__(unit_of_work)

        self.logger = logger
        self.account_repository = account_repository

    def execute(self, account: Account):
        self.logger.info("Executing ---> DomainService[CreateAccount]")

        assert account is not None, "Account cannot be empty"
        return self.account_repository.insert(self.unit_of_work, account)


class ValidateAccountEmail(BaseBusinessRule):

    def __init__(self, logger: Logger, unit_of_work):
        super().__init__(unit_of_work)

        self.logger = logger

    def execute(self, email: str):
        self.logger.info("Executing ---> DomainService[ValidateAccountEmail]")

        assert email is not None, "Email cannot be null"

        email_pattern = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9\-\.\_\+]{0,61}[a-zA-Z0-9]@[a-zA-Z0.9\-\.]*\.[a-z]*")
        return re.fullmatch(email_pattern, email)


class GetAccount(BaseBusinessRule):

    def __init__(self, logger: Logger, unit_of_work, account_repository: AccountRepository):
        super().__init__(unit_of_work)

        self.logger = logger
        self.account_repository = account_repository

    def execute(self, account_id: uuid) -> Account:
        self.logger.info("Executing ---> DomainService[GetAccount]")

        assert account_id is not None, "Account id cannot be empty"

        return self.account_repository.get_by_id(self.unit_of_work, account_id)


class GetAccountByEmail(BaseBusinessRule):

    def __init__(
            self
            , logger: Logger
            , unit_of_work
            , account_repository: AccountRepository
            , validate_account_email_br: ValidateAccountEmail):

        super().__init__(unit_of_work)

        self.logger = logger
        self.account_repository = account_repository
        self.validate_account_email_br = validate_account_email_br

    def execute(self, email: str) -> Optional[Account]:
        self.logger.info("Executing ---> DomainService[GetAccountByEmail]")

        assert email is not None, "Email cannot be null"
        assert self.validate_account_email_br.execute(email), "Not a valid email"

        return self.account_repository.get_by_email(self.unit_of_work, email)


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

    @staticmethod
    def get_account_by_email(unit_of_work) -> GetAccountByEmail:
        raise NotImplemented("AccountBusinessRulesProvider#get_account_by_email is not implemented")
