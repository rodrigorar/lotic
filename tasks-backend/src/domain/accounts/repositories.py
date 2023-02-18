import uuid
from typing import Optional
from src.domain import BaseRepository
from src.domain.accounts import Account


class AccountRepository(BaseRepository):

    def get_by_id(self, unit_of_work, account_id: uuid) -> Optional[Account]:
        raise NotImplemented("AccountRepository#get_by_id is not implemented.")

    def get_by_email(self, unit_of_work, email: str) -> Optional[Account]:
        raise NotImplemented("AccountRepository#get_by_email is not implemented")

    def insert(self, unit_of_work, account: Account) -> uuid:
        raise NotImplemented("AccountRepository#insert is not implemented.")

    def update(self, unit_of_work, account: Account) -> None:
        raise NotImplemented("AccountRepository#update is not implemented.")

    def delete(self, unit_of_work, account_id: uuid) -> None:
        raise NotImplemented("AccountRepository#delete is not implemented.")
    