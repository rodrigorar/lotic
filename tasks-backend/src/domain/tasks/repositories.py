from src.domain import BaseRepository
from src.utils import Maybe


class TasksRepository(BaseRepository):

    def get_by_id(self, unit_of_work, entity_id) -> Maybe:
        raise NotImplemented("TasksRepository#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity):
        raise NotImplemented("TasksRepository#insert is not implemented.")

    def update(self, unit_of_work, entity_id, entity):
        raise NotImplemented("TasksRepository#update is not implemented.")

    def delete(self, unit_of_work, entity_id):
        raise NotImplemented("TasksRepository#delete is not implemented.")

