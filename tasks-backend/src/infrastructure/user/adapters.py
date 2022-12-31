import uuid
from typing import Optional
from src.application import UnitOfWork
from src.domain.users import User, UserBusinessRulesProvider, GetUser, CreateUser, UserRepository


class UserRepositoryImpl(UserRepository):

    def get_by_id(self, unit_of_work: UnitOfWork, user_id: uuid) -> Optional[User]:
        raise NotImplemented("UserRepositoryImpl#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity) -> uuid:
        raise NotImplemented("UserRepositoryImpl#insert is not implemented.")

    def update(self, unit_of_work, entity) -> None:
        raise NotImplemented("UserRepositoryImpl#update is not implemented.")


class UserBusinessRulesProviderImpl(UserBusinessRulesProvider):

    @staticmethod
    def create_user(unit_of_work) -> CreateUser:
        raise NotImplemented("UserBusinessRulesProviderImpl#create_user is not implemented.")

    @staticmethod
    def get_user(unit_of_work) -> GetUser:
        raise NotImplemented("UserBusinessRulesProviderImpl#get_user is not implemented.")


class UserUseCaseProvider:

    @staticmethod
    def create_user():
        raise NotImplemented("UserUseCaseProvider#create_user_use_case is not implemented.")

    @staticmethod
    def get_user():
        raise NotImplemented("UserUseCaseProvider#get_user_use_case is not implemented.")
    