from flask import Blueprint, request

from src.application.example import PersonDTO
from src.infrastructure import from_json, to_json
from src.infrastructure.example import PersonUseCaseProvider
from src.domain import LogProvider

example_bp = Blueprint("/example", __name__)
logger = LogProvider().get()


@example_bp.get("/persons/<int:person_id>")
def get_person(person_id):
    use_case = PersonUseCaseProvider.use_case_get_person()

    logger.info('Get Person called with %s' % str(person_id))

    result = use_case.execute(person_id)
    return "" if result.is_empty() else to_json(result.get()), 200


@example_bp.post("/persons")
def post_person():
    port = from_json(PersonDTO, request.get_data())

    logger.info('Post Person called with %s' % request.get_data())

    use_case = PersonUseCaseProvider.use_case_add_person()
    use_case.execute(port)
    return "", 204


@example_bp.get("/persons/all")
def get_people():
    use_case = PersonUseCaseProvider.use_case_list_people()

    logger.info('Get People called')

    result = use_case.execute(None)
    response = list(map(lambda dto: dto.__dict__, result))
    return to_json(response), 200

