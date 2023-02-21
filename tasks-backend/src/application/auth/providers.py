from typing import Optional
import uuid

from src.application import UnitOfWork
from src.application.auth.models import AuthSession


class AuthTokenStorage:

    def find_by_account_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> Optional[AuthSession]:
        raise NotImplementedError("AuthTokenStorage#get_by_account_id is not implemented")

    def find_by_id(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> Optional[AuthSession]:
        raise NotImplementedError("AuthTokenStorage#get_by_id is not implemented")

    def store(self, unit_of_work: UnitOfWork, auth_session: AuthSession) -> uuid:
        raise NotImplementedError("AuthTokenStorage#insert is not implemented")

    def remove(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> None:
        raise NotImplementedError("AuthTokenStorage#delete is not implemented")

    def remove_all_for_account_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> None:
        raise NotImplementedError("AuthTokenStorage#remove_all_for_account_id is not implemented")
