import uuid

from flask import g


class EncryptionEngine:

    def __init__(self, engine):
        self.engine = engine

    def encrypt(self, value: str):
        raise NotImplementedError('EncryptionEngine#encrypt is not implemented')

    def check(self, hash_value, value: str):
        raise NotImplementedError('EncryptionEngine#check is not implemented')

    def decrypt(self, value: str):
        raise NotImplementedError('EncryptionEngine#decrypt is not implemented')


class AuthorizationContext:

    @staticmethod
    def create_context(auth_token: str, refresh_token: str, account_id: uuid):
        g.auth_token = auth_token
        g.refresh_token = refresh_token
        g.account_id = account_id

    @staticmethod
    def get_token() -> str:
        return g.auth_token

    @staticmethod
    def get_refresh_token() -> str:
        return g.refresh_token

    @staticmethod
    def get_account_id() -> uuid:
        return g.account_id

    @staticmethod
    def is_matching_account(account_id: uuid):
        try:
            context_account_id = AuthorizationContext.get_account_id()
            return context_account_id == account_id
        except Exception:
            return False

    @staticmethod
    def is_known_account():
        try:
            return g.account_id is not None and g.auth_token is not None
        except Exception:
            return False
