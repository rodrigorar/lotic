import uuid
from typing import Optional
from src.domain import BaseRepository
from src.domain.users import User


class UserRepository(BaseRepository):

    def get_by_id(self, unit_of_work, user_id: uuid) -> Optional[User]:
        raise NotImplemented("UserRepository#get_by_id is not implemented.")

    def insert(self, unit_of_work, entity: User) -> uuid:
        raise NotImplemented("UserRepository#insert is not implemented.")

    def update(self, unit_of_work, entity: User) -> None:
        raise NotImplemented("UserRepository#update is not implemented.")

    def delete(self, unit_of_work, user_id: uuid) -> None:
        raise NotImplemented("UserRepository#delete is not implemented.")
    