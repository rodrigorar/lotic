from logging import Logger

from mockito import mock

from src.application import UnitOfWork


class DummyLogger(Logger):

    def __init__(self):
        super().__init__("test-logger", 0)

    def debug(self, msg, *args, **kwargs):
        ...

    def info(self, msg, *args, **kwargs):
        ...

    def warning(self, msg, *args, **kwargs):
        ...

    def warn(self, msg, *args, **kwargs):
        ...

    def error(self, msg, *args, **kwargs):
        ...

    def exception(self, msg, *args, exc_info=True, **kwargs):
        ...

    def critical(self, msg, *args, **kwargs):
        ...

    def fatal(self, msg, *args, **kwargs):
        ...

    def log(self, level, msg, *args, **kwargs):
        ...


class MockDatabase:
    class Column:

        def __init__(self, column_type, nullable=False, primary_key=False, unique=False):
            self.type = column_type
            self.nullable = nullable
            self.primary_key = primary_key
            self.unique = unique

    class Model:
        ...

    class Integer:
        ...

    class String:
        ...

    class DateTime:
        ...

    class ForeignKey:

        def __init__(self, *args):
            self.args = args


class UnitOfWorkMockProvider:

    @staticmethod
    def get():
        return mock(UnitOfWork)
