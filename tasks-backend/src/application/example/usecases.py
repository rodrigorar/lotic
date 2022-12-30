from src.application import UseCase, UnitOfWorkProvider
from src.application.example import PersonDTO
from src.domain.example import PersonServiceProvider, Person
from src.utils import Maybe

from src.domain.tasks import Task
from src.domain.tasks import UserTasks
from src.domain.users import User


class UseCaseAddPerson(UseCase):
    __unit_of_work_provider = None
    __person_service_provider = None

    def __init__(self, unit_of_work_provider: UnitOfWorkProvider, person_service_provider: PersonServiceProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__person_service_provider = person_service_provider

    def execute(self, port: PersonDTO) -> None:
        with self.__unit_of_work_provider.get() as unit_of_work:
            use_case = self.__person_service_provider.add_person_service(unit_of_work)
            use_case.execute(port.to_entity())


class UseCaseGetPerson(UseCase):
    __unit_of_work_provider = None
    __person_service_provider = None

    def __init__(self, unit_of_work_provider: UnitOfWorkProvider, person_service_provider: PersonServiceProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__person_service_provider = person_service_provider

    def execute(self, port) -> Maybe:
        with self.__unit_of_work_provider.get() as unit_of_work:
            use_case = self.__person_service_provider.get_person_service(unit_of_work)
            result = use_case.execute(port)
        return Maybe.empty() if result.is_empty() else result.map(lambda a: PersonDTO.from_entity(a))


class UseCaseListPeople(UseCase):
    __unit_of_work_provider = None
    __person_service_provider = None

    def __init__(self, unit_of_work_provider: UnitOfWorkProvider, person_service_provider: PersonServiceProvider):
        self.__unit_of_work_provider = unit_of_work_provider
        self.__person_service_provider = person_service_provider

    def execute(self, port) -> list[Person]:
        with self.__unit_of_work_provider.get() as unit_of_work:
            use_case = self.__person_service_provider.list_people_service(unit_of_work)
            result = use_case.execute(port)
        return list(map(lambda entity: PersonDTO.from_entity(entity), result))
