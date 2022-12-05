from src.application.example import UseCaseAddPerson, UseCaseGetPerson, UseCaseListPeople
from src.domain.example \
    import Person, PersonRepository, PersonServiceProvider, ServiceListPeople, ServiceGetPerson, ServiceAddPerson
from src.infrastructure.sharedadapters import UnitOfWorkProviderImpl
from src.utils import Maybe


class PersonRepositoryImpl(PersonRepository):

    def get_people(self, unit_of_work, limit: int = 100) -> list[Person]:
        query_manager = unit_of_work.get_manager()
        return query_manager.query(Person).limit(limit).all()

    def get_by_id(self, unit_of_work, person_id: int) -> Maybe:
        assert (unit_of_work is not None), "Unit of work cannot be None!"
        assert (person_id is not None), "No id as been provided!"

        query_manager = unit_of_work.get_manager()
        return Maybe.of(query_manager.query(Person).filter_by(id=person_id).first())

    def insert(self, unit_of_work, entity: Person) -> None:
        assert (unit_of_work is not None), "Unit of work cannot be None!"
        assert (entity is not None), "Person cannot be empty!"

        unit_of_work.get_manager().add(entity)

    def update(self, unit_of_work, person_id: int, entity: Person) -> None:
        assert (unit_of_work is not None), "Unit of work cannot be None!"
        assert (entity is not None), "Person cannot be empty!"
        assert (person_id is not None), "No id as been provided!"

        person = Person.query.filter_by(id=person_id)
        person.first_name = entity.first_name if entity.first_name is not None else person.first_name
        person.last_name = entity.last_name if entity.last_name is not None else person.last_name
        person.age = entity.age if entity.age is not None else person.age

        unit_of_work.get_manager().add(person)

    def delete(self, unit_of_work, person_id: int) -> Maybe:
        query_manager = unit_of_work.get_manager()
        query_manager.query(Person).filter_by(id=person_id).delete()


class PersonServiceProviderImpl(PersonServiceProvider):

    @staticmethod
    def add_person_service(unit_of_work) -> ServiceAddPerson:
        return ServiceAddPerson(unit_of_work, PersonRepositoryImpl())

    @staticmethod
    def get_person_service(unit_of_work) -> ServiceGetPerson:
        return ServiceGetPerson(unit_of_work, PersonRepositoryImpl())

    @staticmethod
    def list_people_service(unit_of_work) -> ServiceListPeople:
        return ServiceListPeople(unit_of_work, PersonRepositoryImpl())


unit_of_work_provider = UnitOfWorkProviderImpl()
person_service_provider = PersonServiceProviderImpl()


class PersonUseCaseProvider:

    @staticmethod
    def use_case_add_person():
        return UseCaseAddPerson(unit_of_work_provider, person_service_provider)

    @staticmethod
    def use_case_get_person():
        return UseCaseGetPerson(unit_of_work_provider, person_service_provider)

    @staticmethod
    def use_case_list_people():
        return UseCaseListPeople(unit_of_work_provider, person_service_provider)
