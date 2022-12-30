
URL_PREFIX_V1 = "/api/v1"


class Maybe(object):
    _content = None

    def __init__(self, content=None):
        self._content = content

    def map(self, operation):
        return Maybe.of(operation(self._content))

    def flat_map(self, operation):
        return operation(self._content).get()

    def get(self):
        return self._content

    def is_empty(self):
        return self._content is None

    def __getitem__(self, item):
        return self._content

    @classmethod
    def empty(cls):
        return Maybe()

    @classmethod
    def of(cls, content):
        return Maybe(content)
