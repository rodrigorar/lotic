from datetime import datetime
from uuid import uuid4

from behave import *
from src.utils import URL_PREFIX_V1


# Given


@given('a valid user')
def step_impl(context):
    from features.environment import JOHN_DOE_ID

    context.account_ids = [JOHN_DOE_ID]


@given('an invalid user')
def step_impl(context):
    context.account_ids = [uuid4()]


@given('several users')
def step_impl(context):
    from features.environment import JOHN_DOE_ID, JANE_DOE_ID

    context.account_ids = [JOHN_DOE_ID, JANE_DOE_ID]


# When


@when('it tries to create a task')
def step_impl(context):

    with context.app.app_context():
        context.result = uuid4()
        context.response = context.client.post(
                URL_PREFIX_V1 + '/tasks'
                , json={
                    "tasks": [
                        {
                            "task_id": str(context.result)
                            , "title": "Yet another task #1"
                            , "description": "Yet another task description #1"
                            , "created_at": str(datetime.now())
                            , "updated_at": str(datetime.now())
                            , "owner_id": str(context.account_ids[0])
                        }
                    ]
                })


@when('it tries to create multiple tasks')
def step_impl(context):

    with context.app.app_context():
        context.result = [uuid4(), uuid4(), uuid4()]
        context.response = context.client.post(
                URL_PREFIX_V1 + '/tasks'
                , json={
                    "tasks": [
                        {
                            "task_id": str(context.result[0])
                            , "title": "Yet another task #1"
                            , "description": "Yet another task description #1"
                            , "created_at": str(datetime.now())
                            , "updated_at": str(datetime.now())
                            , "owner_id": str(context.account_ids[0])
                        },
                        {
                            "task_id": str(context.result[1])
                            , "title": "Yet another task #2"
                            , "description": "Yet another task description #2"
                            , "created_at": str(datetime.now())
                            , "updated_at": str(datetime.now())
                            , "owner_id": str(context.account_ids[0])
                        },
                        {
                            "task_id": str(context.result[2])
                            , "title": "Yet another task #3"
                            , "description": "Yet another task description #3"
                            , "created_at": str(datetime.now())
                            , "updated_at": str(datetime.now())
                            , "owner_id": str(context.account_ids[0]
                                              if len(context.account_ids) == 1
                                              else context.account_ids[1])
                        }
                    ]
                })


# Then


@then('that task should be successfully created')
def step_impl(context):
    from src.domain.tasks import Task

    print(context.response)
    assert context.response is not None
    assert context.response.status_code == 200
    with context.app.app_context():
        db_result = context.db.session.query(Task).filter_by(id=str(context.result)).all()
        assert db_result[0].get_id() == context.result


@then('those tasks should be successfully created')
def step_impl(context):
    from src.domain.tasks import Task

    assert context.response is not None
    assert context.response.status_code == 200
    with context.app.app_context():
        db_result = context.db.session \
            .query(Task) \
            .filter(Task.id.in_([str(entry) for entry in context.result])) \
            .all()

        assert len(db_result) == 3
        for task in db_result:
            assert task.get_id() in context.result


@then('an error should happen for multiple users')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 409


@then('an error should happen for user not found')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 404
