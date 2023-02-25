import threading


class EncryptionEngine:

    def __init__(self, engine):
        self.engine = engine

    def encrypt(self, value: str):
        raise NotImplementedError('EncryptionEngine#encrypt is not implemented')

    def check(self, hash_value, value: str):
        raise NotImplementedError('EncryptionEngine#check is not implemented')

    def decrypt(self, value: str):
        raise NotImplementedError('EncryptionEngine#decrypt is not implemented')


class SessionTokenProvider:

    @staticmethod
    def store_token(auth_token: str):
        threading.local().auth_token = auth_token

    @staticmethod
    def get_token():
        return getattr(threading.local(), 'auth_token', None)
