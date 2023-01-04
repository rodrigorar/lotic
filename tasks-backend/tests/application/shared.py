from logging import Logger

from mockito import mock, when
import pytest

from src.application import UnitOfWork, UnitOfWorkProvider
from src.domain import DatabaseProvider
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

    def get_manager(self):
        return None


class MockedUnitOfWorkProvider(UnitOfWorkProvider):

    @staticmethod
    def get() -> UnitOfWork:
        mocked_logger = mock(Logger)
        when(mocked_logger).error(...)
        return TestUnitOfWorkImpl(mocked_logger)


