from logging import Logger
from typing import Mapping

from mockito import mock, when
import pytest

from src.application import UnitOfWork, UnitOfWorkProvider
from src.domain import DatabaseProvider, LogProvider
from tests.shared import MockDatabase


class ApplicationUnitTestsBase:

    @pytest.fixture(autouse=True)
    def database_provider_aspect(self):
        DatabaseProvider().set_database(MockDatabase())
        yield
        DatabaseProvider().set_database(None)


class TestUnitOfWorkImpl(UnitOfWork):

    def begin(self):
        ...

    def commit(self):
        ...

    def rollback(self):
        ...

    def query(self):
        return None


class MockedUnitOfWorkProvider(UnitOfWorkProvider):

    @staticmethod
    def get() -> UnitOfWork:
        mocked_logger = mock(Logger)
        when(mocked_logger).error(...)
        return TestUnitOfWorkImpl(mocked_logger)


class MockedLogger(Logger):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        super().__init__("test-logger")

    def debug(self, msg: object, *args: object, exc_info = ...,
              stack_info: bool = ..., stacklevel: int = ...,
              extra: Mapping[str, object] | None = ...) -> None:
        ...

    def info(self, msg: object, *args: object, exc_info = ..., stack_info: bool = ...,
             stacklevel: int = ..., extra: Mapping[str, object] | None = ...) -> None:
        ...

    def warning(self, msg: object, *args: object, exc_info = ...,
                stack_info: bool = ..., stacklevel: int = ...,
                extra: Mapping[str, object] | None = ...) -> None:
        ...

    def warn(self, msg: object, *args: object, exc_info = ..., stack_info: bool = ...,
             stacklevel: int = ..., extra: Mapping[str, object] | None = ...) -> None:
        ...

    def error(self, msg: object, *args: object, exc_info = ...,
              stack_info: bool = ..., stacklevel: int = ...,
              extra: Mapping[str, object] | None = ...) -> None:
        ...