from typing import Optional
import uuid

from src.domain import BaseRepository
from src.domain.auth.models import AuthSession


class AuthSessionRepository(BaseRepository):

    def get_by_account_id(self, unit_of_work, account_id: uuid) -> Optional[AuthSession]:
        raise NotImplementedError("AuthSessionRepository#get_by_account_id is not implemented")

    def get_by_id(self, unit_of_work, auth_session_id: uuid) -> Optional[AuthSession]:
        return super().get_by_id(unit_of_work, auth_session_id)

    def insert(self, unit_of_work, auth_session: AuthSession) -> uuid:
        return super().insert(unit_of_work, auth_session)

    def update(self, unit_of_work, auth_session: AuthSession) -> None:
        return super().update(unit_of_work, auth_session)

    def delete(self, unit_of_work, auth_session_id: uuid) -> None:
        return super().delete(unit_of_work, auth_session_id)

