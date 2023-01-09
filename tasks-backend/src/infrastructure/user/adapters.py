from datetime import datetime
import uuid
from typing import Optional
from src.application import UnitOfWork
from src.application.accounts import UseCaseCreateUser, UseCaseGetUser
from src.domain.errors import NotFoundError
from src.domain.accounts import User, UserBusinessRulesProvider, GetUser, CreateUser, UserRepository
from src.infrastructure import UnitOfWorkProviderImpl


class UserRepositoryImpl(UserRepository):

    def get_by_id(self, unit_of_work: UnitOfWork, user_id: uuid) -> Optional[User]:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert user_id is not None, "User id cannot be empty"

        query_manager = unit_of_work.get_manager()
        return query_manager.query(User).filter_by(id=user_id).first()

    def insert(self, unit_of_work: UnitOfWork, user: User) -> uuid:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert user is not None, "User cannot be empty"

        query_manager = unit_of_work.get_manager()
        query_manager.add(user)
        return user.id

    def update(self, unit_of_work: UnitOfWork, user: User) -> None:
        assert unit_of_work is not None, "Unit of work cannot be empty"
        assert user is not None, "User cannot be empty"

        query_manager = unit_of_work.get_manager()
        entry = query_manager.query(User).filter_by(id=user.id).first()
        if entry is None:
            raise NotFoundError("No valid user was found for id " + str(user.id))

        entry.email = user.email if user.email is not None else entry.email
        entry.password = user.password if user.password is not None else entry.password
        entry.updated_at = datetime.now()

        query_manager.add(entry)


class UserBusinessRulesProviderImpl(UserBusinessRulesProvider):

    @staticmethod
    def create_user(unit_of_work) -> CreateUser:
        return CreateUser(unit_of_work, UserRepositoryImpl())

    @staticmethod
    def get_user(unit_of_work) -> GetUser:
        return GetUser(unit_of_work, UserRepositoryImpl())


user_business_rules_provider = UserBusinessRulesProviderImpl()
unit_of_work_provider = UnitOfWorkProviderImpl()


class UserUseCaseProvider:

    @staticmethod
    def create_user():
        return UseCaseCreateUser(unit_of_work_provider, user_business_rules_provider)

    @staticmethod
    def get_user():
        return UseCaseGetUser(unit_of_work_provider, user_business_rules_provider)
    