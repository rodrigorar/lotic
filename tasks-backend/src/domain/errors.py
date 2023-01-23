

class BaseError(Exception):

    def __init__(self, title="", details=""):
        self.title = title
        self.details = details


class NotFoundError(BaseError):

    def __init__(self, title="", details=""):
        super().__init__(title, details)


class ConflictError(BaseError):

    def __init__(self, title="", details=""):
        super().__init__(title, details)


class InternalError(BaseError):

    def __init__(self, title="", details=""):
        super().__init__(title, details)


class InvalidArgumentError(BaseError):

    def __init__(self, title="", details=""):
        super().__init__(title, details)
