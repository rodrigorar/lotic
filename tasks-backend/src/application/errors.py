from src.domain.errors import BaseError


class LoginFailedError(BaseError):

    def __init__(self, details=""):
        super().__init__("login_failed_error", details)


class InvalidAuthorizationError(BaseError):

    def __init__(self, details=""):
        super().__init__("invalid_authorization_error", details)


class AuthorizationError(BaseError):

    def __init__(self, details=""):
        super().__init__("authorization_error", details)
