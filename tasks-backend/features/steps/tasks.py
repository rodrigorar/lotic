from datetime import datetime
import uuid
from uuid import uuid4

from behave import *

from src.infrastructure import from_json
from src.utils import URL_PREFIX_V1


# Given


@given('a valid user')
def step_impl(context):
    from features.environment import JOHN_DOE_ID, JOHN_DOE_AUTH_TOKEN \
        , JOHN_DOE_TASK_1, JOHN_DOE_TASK_2, JOHN_DOE_TASK_3

    context.account_ids = [JOHN_DOE_ID]
    context.auth_tokens = [str(JOHN_DOE_AUTH_TOKEN)]
    context.task_ids = [JOHN_DOE_TASK_1, JOHN_DOE_TASK_2, JOHN_DOE_TASK_3]
    context.invalid_account = False


@given('an invalid user')
def step_impl(context):
    context.account_ids = [uuid4()]
    context.auth_tokens = [str(uuid4())]
    context.invalid_account = True


@given('several users')
def step_impl(context):
    from features.environment import JOHN_DOE_ID, JOHN_DOE_AUTH_TOKEN, JANE_DOE_ID, JANE_DOE_AUTH_TOKEN

    context.account_ids = [JOHN_DOE_ID, JANE_DOE_ID]
    context.auth_tokens = [str(JOHN_DOE_AUTH_TOKEN), str(JANE_DOE_AUTH_TOKEN)]
    context.invalid_account = False


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
                }
                , headers={
                    'XAuthorization': context.auth_tokens[0]
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
                }
                , headers={
                    'XAuthorization': context.auth_tokens[0]
                })


@when('it tries to update a single task')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    with context.app.app_context():
        data = Task(
            uuid4()
            , "Yet another task #1"
            , "Yet another task description #1"
            , datetime.now()
            , datetime.now()
            , context.account_ids[0])
        account_task_data = AccountTasks(context.account_ids[0], data.get_id())
        context.db.session.add(data)
        context.db.session.commit()

        context.task_ids = [data.get_id()]
        context.response = context.client.put(
                URL_PREFIX_V1 + '/tasks'
                , json={
                    "tasks": [
                        {
                            "task_id": data.id
                            , "title": "Yet another task #1 - Updated"
                            , "description": "Yet another task description #1 - Updated"
                            , "updated_at": "2023-02-10T09:00:00Z"
                        }
                    ]
                }
                , headers={
                    'XAuthorization': context.auth_tokens[0]
                })


@when('it tries to update several tasks')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    with context.app.app_context():
        data = [
            Task(
                uuid4()
                , "Yet another task #1"
                , "Yet another task description #1"
                , datetime.now()
                , datetime.now()
                , context.account_ids[0]
            ),
            Task(
                uuid4()
                , "Yet another task #2"
                , "Yet another task description #2"
                , datetime.now()
                , datetime.now()
                , context.account_ids[0]
            ),
            Task(
                uuid4()
                , "Yet another task #3"
                , "Yet another task description #3"
                , datetime.now()
                , datetime.now()
                , context.account_ids[0]
            )
        ]
        account_task_data = [
            AccountTasks(data[0].get_id(), context.account_ids[0]),
            AccountTasks(data[1].get_id(), context.account_ids[0]),
            AccountTasks(data[2].get_id(), context.account_ids[0])
        ]

        for entry in data:
            context.db.session.add(entry)
        for entry in account_task_data:
            context.db.session.add(entry)
        context.db.session.commit()

        context.response = context.client.put(
                URL_PREFIX_V1 + '/tasks'
                , json={
                    "tasks": [
                        {
                            "task_id": data[0].id
                            , "title": "Yet another task #1"
                            , "description": "Yet another task description #1"
                            , "updated_at": "2023-02-01T09:00:00.000Z"
                        },
                        {
                            "task_id": data[1].id
                            , "title": "Yet another task #2"
                            , "description": "Yet another task description #2"
                            , "updated_at": "2022-01-12T14:53:34.000Z"
                        },
                        {
                            "task_id": data[2].id
                            , "title": "Yet another task #3"
                            , "description": "Yet another task description #3"
                            , "updated_at": "2022-01-24T23:51:00.000Z"
                        }
                    ]
                }
                , headers={
                    'XAuthorization': context.auth_tokens[0]
                })


@when('it tries to delete a task')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    context.task_id = uuid4()
    with context.app.app_context():
        task_data = Task(
            context.task_id
            , "Yet another task #1"
            , "Yet another task description #1"
            , datetime.now()
            , datetime.now()
            , context.account_ids[0]
        )
        account_task_data = AccountTasks(context.account_ids[0], task_data.get_id())
        context.db.session.add(task_data)
        context.db.session.add(account_task_data)
        context.db.session.commit()

        context.task_ids = [task_data.get_id()]
        context.response = context.client.delete(
            URL_PREFIX_V1 + '/tasks/' + task_data.id
            , headers={
                'XAuthorization': context.auth_tokens[0]
            })


@when('it tries to delete a non existent task')
def step_impl(context):
    task_id = str(uuid4())
    context.response = context.client.delete(
        URL_PREFIX_V1 + '/tasks/' + task_id
        , headers={
            'XAuthorization': context.auth_tokens[0]
        })


@when('it tries to get account tasks')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    with context.app.app_context():
        for task_id in context.task_ids:
            context.db.session.query(Task).filter_by(id=str(task_id)).delete()
            context.db.session.query(AccountTasks).filter_by(task_id=str(task_id)).delete()
        context.db.session.commit()
        context.response = context.client.get(
            URL_PREFIX_V1 + '/tasks?account_id=' + str(context.account_ids[0])
            , headers={
                'XAuthorization': context.auth_tokens[0]
            })


@when('it tries to get the associated task')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    with context.app.app_context():
        context.db.session.query(Task).filter_by(id=str(context.task_ids[0])).delete()
        context.db.session.query(AccountTasks).filter_by(task_id=str(context.task_ids[0])).delete()
        context.db.session.query(Task).filter_by(id=str(context.task_ids[1])).delete()
        context.db.session.query(AccountTasks).filter_by(task_id=str(context.task_ids[1])).delete()
        context.db.session.commit()

        context.response = context.client.get(
                URL_PREFIX_V1 + '/tasks?account_id=' + str(context.account_ids[0])
                , headers={
                    'XAuthorization': context.auth_tokens[0]
                })


@when('it tries to get all associated tasks')
def step_impl(context):
    if context.invalid_account:
        context.response = context.client \
            .get(URL_PREFIX_V1 + '/tasks?account_id=' + str(context.account_ids[0]))
    else:
        context.response = context.client.get(
            URL_PREFIX_V1 + '/tasks?account_id=' + str(context.account_ids[0])
            , headers={
                'XAuthorization': context.auth_tokens[0]
            })


# Then


@then('that task should be successfully created')
def step_impl(context):
    from src.domain.tasks import Task

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


@then('that task should be successfully updated')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 204


@then('those tasks should be successfully updated')
def step_impl(context):
    print(context.response)
    assert context.response is not None
    assert context.response.status_code == 204


@then('the task should be deleted')
def step_impl(context):
    from src.domain.tasks import Task, AccountTasks

    print(context.response)

    assert context.response is not None
    assert context.response.status_code == 204

    with context.app.app_context():
        tasks_result = context.db.session \
            .query(Task) \
            .filter_by(id=str(context.task_id)) \
            .all()
        assert len(tasks_result) == 0

        account_tasks_result = context.db.session \
            .query(AccountTasks) \
            .filter_by(task_id=str(context.task_id)) \
            .all()
        assert len(account_tasks_result) == 0


@then('a task not found should be returned')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 404


@then('no tasks should be returned')
def step_impl(context):
    from src.infrastructure.tasks import ListAccountTasksResponse

    assert context.response is not None
    assert context.response.status_code == 200
    assert context.response.get_data() is not None

    tasks_json = from_json(None, context.response.get_data())["tasks"]
    task_list = [from_json(ListAccountTasksResponse, task_entry) for task_entry in tasks_json]
    assert len(task_list) == 0


@then('the task should be returned')
def step_impl(context):
    from src.infrastructure.tasks import ListAccountTasksResponse

    assert context.response is not None
    assert context.response.status_code == 200
    assert context.response.get_data() is not None

    tasks_json = from_json(None, context.response.get_data())["tasks"]
    task_list = [from_json(ListAccountTasksResponse, task_entry) for task_entry in tasks_json]

    assert task_list is not None
    assert task_list[0].task_id == str(context.task_ids[2])
    assert task_list[0].owner_id == str(context.account_ids[0])


@then('all account tasks should be returned')
def step_impl(context):
    from src.infrastructure.tasks import ListAccountTasksResponse

    assert context.response is not None
    assert context.response.status_code == 200
    assert context.response.get_data() is not None

    tasks_json = from_json(None, context.response.get_data())["tasks"]
    task_list = [from_json(ListAccountTasksResponse, task_entry) for task_entry in tasks_json]

    assert task_list is not None
    task_1 = task_list[0]
    assert uuid.UUID(task_1.task_id) in context.task_ids
    assert task_1.owner_id == str(context.account_ids[0])

    task_2 = task_list[1]
    assert uuid.UUID(task_2.task_id) in context.task_ids
    assert task_2.owner_id == str(context.account_ids[0])

    task_3 = task_list[2]
    assert uuid.UUID(task_3.task_id) in context.task_ids
    assert task_3.owner_id == str(context.account_ids[0])


@then('an error should happen for multiple users')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 409


@then('an error should happen for user not found')
def step_impl(context):
    assert context.response is not None
    assert context.response.status_code == 401
