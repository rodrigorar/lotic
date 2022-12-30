from src.domain import BaseBusinessRule


class CreateUser(BaseBusinessRule):

    def execute(self, port):
        raise NotImplemented("CreateUser#execute is not implemented.")


class GetUser(BaseBusinessRule):

    def execute(self, port):
        raise NotImplemented("GetUser#execute is not implemented.")
