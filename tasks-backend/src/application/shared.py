from logging import Logger

from sqlalchemy.exc import IntegrityError

from src.domain import ConflictError


class UseCase:

    def execute(self, port):
        raise NotImplemented("UseCase#execute is not implemented!")


class UseCaseCommand(UseCase):

    def execute(self, port) -> None:
        raise NotImplemented("UseCaseCommand#execute is not implemented")


class UseCaseQuery(UseCase):

    def execute(self, port) -> object:
        raise NotImplemented("UseCaseQuery#execute is not implemented")


class DTOTranslator:

    def to_entity(self):
        raise NotImplemented("DTOTranslator#to_entity is not implemented")

    @classmethod
    def from_entity(self, entity):
        raise NotImplemented("DTOTranslator#from_entity is not implemented")


class UnitOfWork:
    __is_started = False

    def __init__(self, logger: Logger):
        self.logger = logger

    def begin(self):
        raise NotImplemented("UnitOfWork#begin is not implemented!")

    def commit(self):
        raise NotImplemented("UnitOfWork#commit is not implemented!")

    def flush(self):
        raise NotImplemented("UnitOfWork#flush is not implemented")

    def rollback(self):
        raise NotImplemented("UnitOfWork#rollback is not implemented!")

    def query(self):
        raise NotImplemented("UnitOfWork#get_manager is not implemented")

    def __enter__(self):
        if not self.__is_started:
            self.begin()
            self.__is_started = True
        return self

    def __exit__(self, exc_type, exc_value, tb):
        try:
            if exc_type is None:
                self.commit()
                self.__is_closed = True
            elif exc_type is not None:
                self.logger.error("Unit of work failed, rolling back")
                self.logger.error(exc_value)
                self.rollback()
        except IntegrityError:
            raise ConflictError("Database integrity compromised")


class UnitOfWorkProvider:

    @staticmethod
    def get() -> UnitOfWork:
        raise NotImplemented("UnitOfWorkProvider#get not implemented!")
