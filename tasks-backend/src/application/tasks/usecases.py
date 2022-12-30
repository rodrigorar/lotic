from src.application import UseCase


class UseCaseCreateTask(UseCase):

    def execute(self, port):
        raise NotImplemented("UseCaseCreateTask#execute is not implemented.")


class UseCaseUpdateTasks(UseCase):

    def execute(self, port):
        raise NotImplemented("UseCaseUpdateTasks#execute is not implemented.")


class UseCaseDeleteTasks(UseCase):

    def execute(self, port):
        raise NotImplemented("UseCaseDeleteTasks#execute is not implemented.")


class UseCaseListTasksForUser(UseCase):

    def execute(self, port):
        raise NotImplemented("UseCaseListTasksForUser#execute is not implemented.")
