import json


def from_json(container, data: str):
    if container is None:
        result = json.loads(data)
    else:
        result = container(**json.loads(data))
    return result


def to_json(data):
    if type(data) == list or type(data) == map or type(data) == dict:
        return json.dumps(data)
    return json.dumps(data.__dict__)
