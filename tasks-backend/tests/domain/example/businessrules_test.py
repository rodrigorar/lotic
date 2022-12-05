import pytest as pytest
from src.domain import DatabaseProvider, LogProvider
from src.utils import Maybe
from tests.shared import MockDatabase


class TestServiceGetPerson:

    def test_should_fail_no_id_provided(self):
        DatabaseProvider().set_database(MockDatabase())

        from src.domain.example.businessrules import ServiceGetPerson

        under_test = ServiceGetPerson(None, None)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_succeed(self, mocker):
        DatabaseProvider().set_database(MockDatabase())

        from src.domain.example import Person

        mocker.patch(
            'src.domain.example.repositories.PersonRepository.get_by_id',
            lambda slf, unit_of_work, port: Maybe.of(Person("John", "Doe", 21))
        )

        from src.domain.example.businessrules import ServiceGetPerson
        from src.domain.example import PersonRepository
        from src.application import UnitOfWork

        under_test = ServiceGetPerson(UnitOfWork(LogProvider().get()), PersonRepository())
        result = under_test.execute(1)

        assert result is not None
        assert result.is_empty() is False
        assert result.get().first_name == "John"
        assert result.get().last_name == "Doe"
        assert result.get().age == 21
