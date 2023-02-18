from datetime import datetime
import uuid
from typing import Optional
from src.application import UnitOfWork
from src.application.accounts import UseCaseCreateAccount, UseCaseGetAccount
from src.domain import LogProvider, NotFoundError
from src.domain.accounts import \
    Account, AccountBusinessRulesProvider, GetAccount \
    , CreateAccount, AccountRepository, ValidateAccountEmail
from src.infrastructure import UnitOfWorkProviderImpl
from src.infrastructure.auth import EncryptionEngineBCrypt


class AccountRepositoryImpl(AccountRepository):

    def get_by_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> Optional[Account]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_id is not None, "Account id cannot be empty"

        query_manager = unit_of_work.query()
        return query_manager.query(Account).filter_by(id=str(account_id)).first()

    def insert(self, unit_of_work: UnitOfWork, account: Account) -> uuid:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account is not None, "Account cannot be empty"

        query_manager = unit_of_work.query()
        query_manager.add(account)
        return account.id

    def update(self, unit_of_work: UnitOfWork, account: Account) -> None:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account is not None, "Account cannot be empty"

        query_manager = unit_of_work.query()
        entry = query_manager.query(Account).filter_by(id=account.id).first()
        if entry is None:
            raise NotFoundError("No valid accounts was found for id " + str(account.id))

        entry.subject = account.email if account.email is not None else entry.subject
        entry.secret = account.password if account.password is not None else entry.secret
        entry.updated_at = datetime.now()

        query_manager.add(entry)


encryption_engine = EncryptionEngineBCrypt()


class AccountBusinessRulesProviderImpl(AccountBusinessRulesProvider):

    @staticmethod
    def create_account(unit_of_work) -> CreateAccount:
        return CreateAccount(unit_of_work, AccountRepositoryImpl(), encryption_engine)

    @staticmethod
    def validate_account_email(unit_of_work) -> ValidateAccountEmail:
        return ValidateAccountEmail(unit_of_work)

    @staticmethod
    def get_account(unit_of_work) -> GetAccount:
        return GetAccount(unit_of_work, AccountRepositoryImpl())


account_business_rules_provider = AccountBusinessRulesProviderImpl()
unit_of_work_provider = UnitOfWorkProviderImpl()


class AccountUseCaseProvider:

    @staticmethod
    def create_account():
        return UseCaseCreateAccount(
            unit_of_work_provider
            , account_business_rules_provider
            , LogProvider().get())

    @staticmethod
    def get_account():
        return UseCaseGetAccount(
            unit_of_work_provider
            , account_business_rules_provider
            , LogProvider().get())
    