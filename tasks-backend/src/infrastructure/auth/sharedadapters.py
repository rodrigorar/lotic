import bcrypt

from src.domain.auth import EncryptionEngine


class EncryptionEngineBCrypt(EncryptionEngine):

    def __init__(self):
        super().__init__(bcrypt)

    def encrypt(self, value: str):
        return self.engine.hashpw(value.encode('UTF-8'), self.engine.gensalt())

    def check(self, hash_value, value: str):
        return self.engine.checkpw(value, hash_value)

    def decrypt(self, value: str):
        raise NotImplementedError('EncryptionEngineBCrypt#decrypt is not implemented')
