from dataclasses import dataclass
from src.application import DTOTranslator
from src.domain.example import Person


@dataclass()
class PersonDTO(DTOTranslator):

    def __init__(self, first_name: str, last_name: str, age: int = 0, person_id: int = 0):
        self.person_id = person_id
        self.first_name = first_name
        self.last_name = last_name
        self.age = age

    def name(self) -> str:
        return self.first_name + ' ' + self.last_name

    def to_entity(self) -> Person:
        return Person(first_name=self.first_name, last_name=self.last_name, age=self.age)

    @classmethod
    def from_entity(cls, entity: Person):
        return PersonDTO(entity.first_name, entity.last_name, entity.age, entity.id)
