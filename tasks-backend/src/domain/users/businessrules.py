from src.domain import BaseBusinessRule
from src.domain.users import UserRepository, User


class CreateUser(BaseBusinessRule):

    def __init__(self, unit_of_work, user_repository: UserRepository):
        super().__init__(unit_of_work)
        self.user_repository = user_repository

    def execute(self, user: User):
        assert user is not None, "User entity cannot be empty"
        return self.user_repository.insert(self.unit_of_work, user)


class GetUser(BaseBusinessRule):

    def execute(self, port):
        raise NotImplemented("GetUser#execute is not implemented.")


class UserBusinessRulesProvider:

    @staticmethod
    def create_user(unit_of_work) -> CreateUser:
        raise NotImplemented("UserBusinessRulesProvider#created_user is not implemented.")

    @staticmethod
    def get_user(unit_of_work) -> GetUser:
        raise NotImplemented("#UserBusinessRulesProvider#get_user is not implemented.")
