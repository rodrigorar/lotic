from datetime import datetime
import uuid
from typing import Optional
from src.application import UnitOfWork
from src.application.accounts import UseCaseCreateAccount, UseCaseGetAccount
from src.domain import LogProvider, NotFoundError
from src.domain.accounts import \
    Account, AccountBusinessRulesProvider, GetAccount \
    , CreateAccount, AccountRepository, GetAccountByEmail, ValidateAccountEmail


logger = LogProvider().get()


class AccountRepositoryImpl(AccountRepository):

    def get_by_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> Optional[Account]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert account_id is not None, "Account id cannot be empty"

        query_manager = unit_of_work.query()
        return query_manager.query(Account).filter_by(id=str(account_id)).first()

    def get_by_email(self, unit_of_work, email: str) -> Optional[Account]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert email is not None, "Email cannot be empty"

        query_manager = unit_of_work.query()
        return query_manager.query(Account).filter_by(email=email).first()

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


# We do this here, to try and save a bit on memory usage
account_repository = AccountRepositoryImpl()


class AccountBusinessRulesProviderImpl(AccountBusinessRulesProvider):

    @staticmethod
    def create_account(unit_of_work) -> CreateAccount:
        return CreateAccount(logger, unit_of_work, account_repository)

    @staticmethod
    def validate_account_email(unit_of_work) -> ValidateAccountEmail:
        return ValidateAccountEmail(logger, unit_of_work)

    @staticmethod
    def get_account(unit_of_work) -> GetAccount:
        return GetAccount(unit_of_work, account_repository)

    @staticmethod
    def get_account_by_email(unit_of_work) -> GetAccountByEmail:
        return GetAccountByEmail(unit_of_work, account_repository, ValidateAccountEmail(logger, unit_of_work))


# This needs to be here because of order of inputs
from src.infrastructure.auth import EncryptionEngineBCrypt
from src.infrastructure import UnitOfWorkProviderImpl

# We do this here, to try and save a bit on memory usage
unit_of_work_provider = UnitOfWorkProviderImpl()
account_br_provider = AccountBusinessRulesProviderImpl()
encryption_engine = EncryptionEngineBCrypt()


class AccountUseCaseProvider:

    @staticmethod
    def create_account():
        return UseCaseCreateAccount(
            logger
            , unit_of_work_provider
            , account_br_provider
            , encryption_engine)

    @staticmethod
    def get_account():
        from src.infrastructure import UnitOfWorkProviderImpl

        return UseCaseGetAccount(
            logger
            , unit_of_work_provider
            , account_br_provider)
    