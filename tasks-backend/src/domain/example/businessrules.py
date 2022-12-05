from src.domain.example import Person, PersonRepository
from src.domain import BaseBusinessRule
from src.utils import Maybe


class ServiceAddPerson(BaseBusinessRule):

    def __init__(self, unit_of_work, person_repository: PersonRepository):
        super().__init__(unit_of_work)
        self.person_repository = person_repository

    def execute(self, port: Person):
        assert (port.first_name is not None), "First Name cannot be empty!"
        assert (port.last_name is not None), "Last Name cannot be empty!"
        assert (port.age is not None), "Age cannot be empty!"
        self.person_repository.insert(self.unit_of_work, port)


class ServiceGetPerson(BaseBusinessRule):

    def __init__(self, unit_of_work, person_repository: PersonRepository):
        super().__init__(unit_of_work)
        self.person_repository = person_repository

    def execute(self, port) -> Maybe:
        assert (port is not None), "No id provided to obtain a person"
        return self.person_repository.get_by_id(self.unit_of_work, port)


class ServiceListPeople(BaseBusinessRule):

    def __init__(self, unit_of_work, person_repository: PersonRepository):
        super().__init__(unit_of_work)
        self.person_repository = person_repository

    def execute(self, port):
        return self.person_repository.get_people(self.unit_of_work, port)


class PersonServiceProvider:

    @staticmethod
    def add_person_service(unit_of_work) -> ServiceAddPerson:
        raise NotImplemented("PersonServiceProvider#add_person_service not implemented!")

    @staticmethod
    def get_person_service(unit_of_work) -> ServiceGetPerson:
        raise NotImplemented("PersonServiceProvider#get_person_service not implemented!")

    @staticmethod
    def list_people_service(unit_of_work) -> ServiceListPeople:
        raise NotImplemented("PersonServiceProvider#list_people_service not implemented!")

