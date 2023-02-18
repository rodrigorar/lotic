

class BaseError(Exception):

    def __init__(self, title="", details=""):
        self.title = title
        self.details = details


class NotFoundError(BaseError):

    def __init__(self, details=""):
        super().__init__("not_found_error", details)


class ConflictError(BaseError):

    def __init__(self, details=""):
        super().__init__("conflict_error", details)


class InternalError(BaseError):

    def __init__(self, details=""):
        super().__init__("internal_error", details)


class InvalidArgumentError(BaseError):

    def __init__(self, details=""):
        super().__init__("invalid_argument_error", details)


class LoginFailedError(BaseError):

    def __init__(self, details=""):
        super().__init__("login_failed_error", details)
