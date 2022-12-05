import json
from src.domain import DatabaseProvider

db = DatabaseProvider().get()


class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer, nullable=False)

    def __init__(self, first_name, last_name, age):
        self.first_name = first_name
        self.last_name = last_name
        self.age = age

    def name(self) -> str:
        return self.first_name + " " + self.last_name

    @classmethod
    def from_json(cls, json_data):
        values = json.loads(json_data)
        return cls(values["id"], values["first_name"], values["last_name"], values["age"])
