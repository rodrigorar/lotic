import uuid

from src.application import UseCase, UnitOfWorkProvider
from src.application.users import UserDTO
from src.domain.users import CreateUser, GetUser, UserBusinessRulesProvider


class UseCaseCreateUser(UseCase):
    __unit_of_work_provider = None
    __user_business_rules_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , user_business_rules_provider: UserBusinessRulesProvider):

        self.__unit_of_work_provider = unit_of_work_provider
        self.__user_business_rules_provider = user_business_rules_provider

    def execute(self, user: UserDTO):
        raise NotImplemented("UseCaseCreateUser#execute is not implemented.")


class UseCaseGetUser(UseCase):
    __unit_of_work_provider = None
    __user_business_rules_provider = None

    def __init__(
            self
            , unit_of_work_provider: UnitOfWorkProvider
            , user_business_rules_provider: UserBusinessRulesProvider):

        self.__unit_of_work_provider = unit_of_work_provider
        self.__user_business_rules_provider = user_business_rules_provider

    def execute(self, user_id: uuid):
        raise NotImplemented("UseCaseGetUser#execute is not implemented.")
