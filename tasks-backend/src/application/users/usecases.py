import uuid

from src.application import UseCase, UnitOfWorkProvider
from src.application.users import UserDTO
from src.domain.users import UserBusinessRulesProvider


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
        assert user is not None, "User cannot be empty"

        with self.__unit_of_work_provider.get() as unit_of_work:
            business_rule = self.__user_business_rules_provider.create_user(unit_of_work)
            result = business_rule.execute(user.to_entity())
        return result


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
        assert user_id is not None, "User id cannot be empty"

        with self.__unit_of_work_provider.get() as unit_of_work:
            business_rule = self.__user_business_rules_provider.get_user(unit_of_work)
            result = business_rule.execute(user_id)
        return UserDTO.from_entity(result) if result is not None else None
