from datetime import datetime
import os
from uuid import uuid4

from src.domain import DatabaseProvider

from behave import fixture, use_fixture


@fixture
def tasks_server(context, timeout=30, **kwargs):
    try:
        from src.app import app

        context.app = app
        context.client = app.test_client()
        context.db = DatabaseProvider().get()
        yield context.client
    finally:
        os.remove('instance/integration_tests.sqlite')


tagged_fixtures = {
    'fixture.tasks.server': tasks_server
}


def before_tag(context, tag):
    fixture_function = tagged_fixtures.get(tag)
    if fixture_function is None:
        raise LookupError("Unknown fixture %s" % tag)
    use_fixture(fixture_function, context, timeout=10)


def before_scenario(context, scenario):
    from src.domain.accounts import Account
    from src.domain.tasks import Task, AccountTasks

    print('Before %s ' % scenario.name)
    with context.app.app_context():

        # John Doe Data

        john_doe_id = uuid4()
        context.db.session.add(Account(john_doe_id, 'john.doe@mail.not', 'passwd01', datetime.now(), datetime.now()))

        john_doe_task_1 = uuid4()
        john_doe_task_2 = uuid4()
        john_doe_task_3 = uuid4()
        context.db.session.add(Task(john_doe_task_1, 'John Doe Task #1', 'John Doe Task #1 Description', datetime.now(), datetime.now(), john_doe_id))
        context.db.session.add(Task(john_doe_task_2, 'John Doe Task #2', 'John Doe Task #2 Description', datetime.now(), datetime.now(), john_doe_id))
        context.db.session.add(Task(john_doe_task_3, 'John Doe Task #3', 'John Doe Task #3 Description', datetime.now(), datetime.now(), john_doe_id))

        context.db.session.add(AccountTasks(john_doe_id, john_doe_task_1))
        context.db.session.add(AccountTasks(john_doe_id, john_doe_task_2))
        context.db.session.add(AccountTasks(john_doe_id, john_doe_task_3))

        # Jane Doe Data

        jane_doe_id = uuid4()
        context.db.session.add(Account(jane_doe_id, 'jane.doe@mail.not', 'passwd02', datetime.now(), datetime.now()))

        jane_doe_task_1 = uuid4()
        jane_doe_task_2 = uuid4()
        context.db.session.add(Task(jane_doe_task_1, 'Jane Doe Task #1', 'Jane Doe Task #1 Description', datetime.now(), datetime.now(), jane_doe_id))
        context.db.session.add(Task(jane_doe_task_2, 'Jane Doe Task #2', 'Jane Doe Task #2 Description', datetime.now(), datetime.now(), jane_doe_id))

        context.db.session.add(AccountTasks(jane_doe_id, jane_doe_task_1))
        context.db.session.add(AccountTasks(jane_doe_id, jane_doe_task_2))

        context.db.session.commit()
    # Load the data into the database


def after_scenario(context, scenario):
    from src.domain.accounts import Account

    print('After %s' % scenario.name)
    with context.app.app_context():
        result = context.db.session.query(Account).all()
        for entry in result:
            context.db.session.delete(entry)
        context.db.session.commit()
