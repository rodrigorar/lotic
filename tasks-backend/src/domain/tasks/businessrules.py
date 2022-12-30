import uuid

from src.domain import BaseBusinessRule
from src.domain.tasks import Task


class CreateTasks(BaseBusinessRule):
    def execute(self, port: list[Task]) -> list[uuid]:
        raise NotImplemented("CreateTask#execute is not implemented.")


class UpdateTasks(BaseBusinessRule):

    def execute(self, port: list[Task]):
        raise NotImplemented("UpdateTasks#execute is not implemented.")


class DeleteTasks(BaseBusinessRule):

    def execute(self, port: list[uuid]):
        raise NotImplemented("DeleteTasks#execute is not implemented.")


class ListTasksForUser(BaseBusinessRule):

    def execute(self, port):
        raise NotImplemented("ListTasksForUser#execute is not implemented.")
