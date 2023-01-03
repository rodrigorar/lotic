from mockito import mock
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


class MockedUnitOfWorkProvider(UnitOfWorkProvider):

    @staticmethod
    def get() -> UnitOfWork:
        return mock(UnitOfWork)
