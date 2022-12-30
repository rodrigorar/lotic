from src.domain.example import Person
from src.domain import BaseRepository
from src.utils import Maybe


class PersonRepository(BaseRepository):

    def get_people(self, unit_of_work, limit: int) -> list[Person]:
        raise NotImplemented("PersonRepository#get_people is not implemented!")

    def get_by_id(self, unit_of_work, person_id: int) -> Maybe:
        raise NotImplemented("PersonRepository#get_by_id is not implemented!")

    def insert(self, unit_of_work, entity: Person) -> None:
        raise NotImplemented("PersonRepository#insert is not implemented!")

    def update(self, unit_of_work, entity: Person) -> None:
        raise NotImplemented("PersonRepository#update is not implemented!")

    def delete(self, unit_of_work, person_id: int) -> Maybe:
        raise NotImplemented("PersonRepository#delete is not implemented!")

