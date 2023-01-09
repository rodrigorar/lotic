from datetime import datetime
from uuid import uuid4

from src.application.accounts import AccountDTO


class CreateAccountRequest:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password

    def to_dto(self):
        return AccountDTO(uuid4(), self.email, self.password, datetime.now(), datetime.now())

