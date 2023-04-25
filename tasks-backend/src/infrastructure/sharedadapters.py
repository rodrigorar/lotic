from logging import Logger

from src.application import UnitOfWork, UnitOfWorkProvider
from src.domain import LogProvider


class AppProvider:
    _instance = None
    _app = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def set_app(self, app):
        self._app = app

    def get_app(self):
        return self._app


class DatabaseSessionProvider:
    _instance = None
    _db_session_provider = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    def set_session_provider(self, session_provider):
        self._db_session_provider = session_provider

    def get_session(self):
        return self._db_session_provider.session


class UnitOfWorkImpl(UnitOfWork):
    _db_session = None

    def __init__(self, logger: Logger):
        super().__init__(logger)

        self.session_provider = DatabaseSessionProvider()

    def begin(self):
        self._db_session = self.session_provider.get_session()

    def commit(self):
        self._db_session.commit()

    def flush(self):
        self._db_session.flush()

    def rollback(self):
        self._db_session.rollback()

    def query(self):
        return self._db_session


class UnitOfWorkProviderImpl(UnitOfWorkProvider):

    @staticmethod
    def get() -> UnitOfWork:
        return UnitOfWorkImpl(LogProvider().get())
