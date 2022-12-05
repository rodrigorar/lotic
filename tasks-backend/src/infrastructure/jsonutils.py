import json


def from_json(container, data: str):
    return container(**json.loads(data))


def to_json(data):
    if type(data) == list or type(data) == map or type(data) == dict:
        return json.dumps(data)
    return json.dumps(data.__dict__)
