from mockito import mock

from src.application import UnitOfWork


class MockDatabase:
    class Column:

        def __init__(self, column_type, nullable=False, primary_key=False):
            self.type = column_type
            self.nullable = nullable
            self.primary_key = primary_key

    class Model:
        ...

    class Integer:
        ...

    class String:
        ...


class UnitOfWorkMockProvider:

    @staticmethod
    def get():
        return mock(UnitOfWork)
