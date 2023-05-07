import json

from src.domain import LogProvider


def from_json(container, data: str):
    if container is None:
        result = json.loads(data)
    else:
        result = container(**json.loads(data))
    return result


def to_json(data):
    if type(data) == list or type(data) == map or type(data) == dict:
        return json.dumps(data, default=lambda o: o.__dict__)
    return json.dumps(data, default=lambda o: o.__dict__)
