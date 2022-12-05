

class MockDatabase:
    class Column:

        def __init__(self, type, nullable=False, primary_key=False):
            self.type = type
            self.nullable = nullable
            self.primary_key = primary_key

        def no_op(self):
            print("no_op")

    class Model:

        def no_op(self):
            print("no_op")

    class Integer:
        def no_op(self):
            print("no_op")

    class String:
        def no_op(self):
            print("no_op")
