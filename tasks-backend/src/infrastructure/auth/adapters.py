from datetime import datetime
from typing import Optional
import uuid

import bcrypt
from sqlalchemy import column

from src.application import UnitOfWork
from src.domain import NotFoundError
from src.domain.auth import EncryptionEngine
from src.domain.auth.models import AuthSession
from src.domain.auth.repositories import AuthSessionRepository


class EncryptionEngineBCrypt(EncryptionEngine):

    def __init__(self):
        super().__init__(bcrypt)

    def encrypt(self, value: str):
        return self.engine.hashpw(value.encode('UTF-8'), self.engine.gensalt())

    def check(self, hash_value, value: str):
        return self.engine.checkpw(value, hash_value)

    def decrypt(self, value: str):
        raise NotImplementedError('EncryptionEngineBCrypt#decrypt is not implemented')


class AuthSessionRepositoryImpl(AuthSessionRepository):

    def get_by_account_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> Optional[AuthSession]:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert account_id is not None, "Account id cannot be null"

        query_manager = unit_of_work.query()
        return query_manager.query(AuthSession) \
            .filter_by(account_id=str(account_id)) \
            .filter_by(column("expires_at") > datetime.now()) \
            .first()

    def get_by_id(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> Optional[AuthSession]:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session_id is not None, "Auth session id cannot be null"

        query_manager = unit_of_work.query()
        return query_manager.query(AuthSession) \
            .filter_by(id=str(auth_session_id)) \
            .filter_by(column("expires_at") > datetime.now()) \
            .first()

    def insert(self, unit_of_work: UnitOfWork, auth_session: AuthSession) -> uuid:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session is not None, "Auth session cannot be null"

        query_manager = unit_of_work.query()
        query_manager.add(auth_session)
        return auth_session.get_id()

    def update(self, unit_of_work, auth_session: AuthSession) -> None:
        raise NotImplementedError("AuthSessionRepositoryImpl#update is not implemented")

    def delete(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> None:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session_id is not None, "Auth Session id cannot be null"

        query_manager = unit_of_work.query()
        auth_session = query_manager.query(AuthSession).filter_by(id=str(auth_session_id)).first()
        if auth_session is None:
            raise NotFoundError("No Auth Session found for id " + str(auth_session_id))
        query_manager.delete(auth_session)

