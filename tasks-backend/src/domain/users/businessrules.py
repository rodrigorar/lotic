from src.domain import BaseBusinessRule


class CreateUser(BaseBusinessRule):

    def execute(self, port):
        raise NotImplemented("CreateUser#execute is not implemented.")


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
