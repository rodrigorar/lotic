from src.application.auth import Principal


class LoginRequest:

    def __init__(self, subject: str, secret: str):
        self.subject = subject
        self.secret = secret

    def to_dto(self):
        return Principal(self.subject, self.secret)
