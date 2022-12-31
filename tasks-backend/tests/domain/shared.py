import pytest

from src.domain import DatabaseProvider
from tests.shared import MockDatabase


class DomainUnitTestsBase:

    @pytest.fixture(autouse=True)
    def database_provider_aspect(self):
        DatabaseProvider().set_database(MockDatabase())
        yield
        DatabaseProvider().set_database(None)
