

class NotFoundError(Exception):

    def __init__(self, title="", details=""):
        self.title = title
        self.details = details


class ConflictError(Exception):

    def __init__(self, title="", details=""):
        self.title = title
        self.details = details
