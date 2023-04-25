from datetime import datetime
from typing import Optional
import uuid

import bcrypt
from sqlalchemy import and_

from src.application import UnitOfWork
from src.domain import LogProvider, NotFoundError
from src.application.auth import EncryptionEngine, AuthTokenStorage, UseCaseLogin, UseCaseLogout, \
    UseCaseRefresh, AuthSession
from src.infrastructure import UnitOfWorkProviderImpl


class EncryptionEngineBCrypt(EncryptionEngine):

    def __init__(self):
        super().__init__(bcrypt)

    def encrypt(self, value: str):
        return self.engine.hashpw(value.encode('UTF-8'), self.engine.gensalt())

    def check(self, hash_value, value: str):
        return self.engine.checkpw(value.encode('UTF-8'), hash_value)

    def decrypt(self, value: str):
        raise NotImplementedError('EncryptionEngineBCrypt#decrypt is not implemented')


class AuthTokenStorageImpl(AuthTokenStorage):

    def find_by_account_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> Optional[AuthSession]:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert account_id is not None, "Account id cannot be null"

        query_manager = unit_of_work.query()
        result = query_manager.query(AuthSession) \
            .filter(and_(
                AuthSession.account_id == str(account_id)
                , AuthSession.expires_at > datetime.now())) \
            .first()
        return AuthSession(
            result.id
            , result.refresh_token
            , result.account_id
            , result.created_at
            , result.expires_at
            , result.refresh_expires_at) if result is not None else None

    def find_by_id(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> Optional[AuthSession]:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session_id is not None, "Auth session id cannot be null"

        query_manager = unit_of_work.query()
        result = query_manager.query(AuthSession) \
            .filter_by(id=str(auth_session_id)) \
            .first()
        return AuthSession(
            result.id
            , result.refresh_token
            , result.account_id
            , result.created_at
            , result.expires_at
            , result.refresh_expires_at) if result is not None else None

    def find_by_refresh_token(self, unit_of_work: UnitOfWork, refresh_token: str) -> Optional[AuthSession]:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert refresh_token is not None, "Refresh token cannot be null"

        query_manager = unit_of_work.query()
        refresh_token = refresh_token
        result = query_manager.query(AuthSession) \
            .filter_by(refresh_token=refresh_token) \
            .first()
        return AuthSession(
            result.id
            , result.refresh_token
            , result.account_id
            , result.created_at
            , result.expires_at
            , result.refresh_expires_at) if result is not None else None

    def store(self, unit_of_work: UnitOfWork, auth_session: AuthSession) -> uuid:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session is not None, "Auth session cannot be null"

        query_manager = unit_of_work.query()
        query_manager.add(auth_session)
        return auth_session.get_id()

    def remove(self, unit_of_work: UnitOfWork, auth_session_id: uuid) -> None:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert auth_session_id is not None, "Auth Session id cannot be null"

        query_manager = unit_of_work.query()
        query_manager.query(AuthSession) \
            .filter_by(id=str(auth_session_id)) \
            .delete()

    def remove_all_for_account_id(self, unit_of_work: UnitOfWork, account_id: uuid) -> None:
        assert unit_of_work is not None, "Unit of Work cannot be null"
        assert account_id is not None, "Account id cannot be null"

        query_manager = unit_of_work.query()
        query_manager.query(AuthSession) \
            .filter_by(account_id=str(account_id)) \
            .delete()


unit_of_work_provider = UnitOfWorkProviderImpl()


class AuthUseCaseProvider:

    @staticmethod
    def login():
        from src.infrastructure.accounts import AccountBusinessRulesProviderImpl

        return UseCaseLogin(
            unit_of_work_provider
            , AccountBusinessRulesProviderImpl()
            , AuthTokenStorageImpl()
            , EncryptionEngineBCrypt())

    @staticmethod
    def refresh():
        return UseCaseRefresh(unit_of_work_provider, AuthTokenStorageImpl())

    @staticmethod
    def logout():
        return UseCaseLogout(unit_of_work_provider, AuthTokenStorageImpl())
