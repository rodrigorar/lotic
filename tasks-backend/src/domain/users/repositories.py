from src.domain import BaseRepository
from src.utils import Maybe


class UserRepository(BaseRepository):

    def get_by_id(self, unit_of_work, entity_id) -> Maybe:
        raise NotImplemented("UserRepository#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity):
        raise NotImplemented("UserRepository#insert is not implemented.")

    def update(self, unit_of_work, entity):
        raise NotImplemented("UserRepository#update is not implemented.")

    def delete(self, unit_of_work, entity_id):
        raise NotImplemented("UserRepository#delete is not implemented.")
    