from mockito import mock

from src.application import UnitOfWork


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

    class ForeignKey:

        def __init__(self, *args):
            self.args = args


class UnitOfWorkMockProvider:

    @staticmethod
    def get():
        return mock(UnitOfWork)
