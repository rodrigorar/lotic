from datetime import datetime
import uuid

from src.domain import DatabaseProvider

from behave import fixture, use_fixture

JOHN_DOE_ID = uuid.UUID("59dc6d88-d894-4d26-a2d5-dad9c57cde05")
JOHN_DOE_TASK_1 = uuid.UUID("7dd8eda4-dd7e-404c-a578-84eafdad1086")
JOHN_DOE_TASK_2 = uuid.UUID("db62fd6b-b958-4cef-8efa-07dce85133b9")
JOHN_DOE_TASK_3 = uuid.UUID("30fa464f-4692-45aa-a4d2-752dc19fa0cc")

JANE_DOE_ID = uuid.UUID("065c2e09-06d0-4000-a152-e95aebd4a9ca")
JANE_DOE_TASK_1 = uuid.UUID("fd612110-1f34-4154-b3f2-bf15a12da4e0")
JANE_DOE_TASK_2 = uuid.UUID("67d32420-cb8c-4c7a-8ecc-fe1862b44e71")


@fixture
def tasks_server(context, timeout=30, **kwargs):
    try:
        from src.app import app

        context.app = app
        context.client = app.test_client()
        context.db = DatabaseProvider().get()
        yield context.client
        context.app = None
        context.client = None
        context.db = None
    except Exception as e:
        print(e)


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

    with context.app.app_context():

        # John Doe Data

        context.db.session.add(
            Account(
                JOHN_DOE_ID
                , 'john.doe@mail.not'
                , 'passwd01'
                , datetime.now()
                , datetime.now()))

        context.db.session.add(
            Task(
                JOHN_DOE_TASK_1
                , 'John Doe Task #1'
                , 'John Doe Task #1 Description'
                , datetime.now()
                , datetime.now()
                , JOHN_DOE_ID))
        context.db.session.add(
            Task(
                JOHN_DOE_TASK_2
                , 'John Doe Task #2'
                , 'John Doe Task #2 Description'
                , datetime.now()
                , datetime.now()
                , JOHN_DOE_ID))
        context.db.session.add(
            Task(
                JOHN_DOE_TASK_3
                , 'John Doe Task #3'
                , 'John Doe Task #3 Description'
                , datetime.now()
                , datetime.now()
                , JOHN_DOE_ID))

        context.db.session.add(AccountTasks(JOHN_DOE_ID, JOHN_DOE_TASK_1))
        context.db.session.add(AccountTasks(JOHN_DOE_ID, JOHN_DOE_TASK_2))
        context.db.session.add(AccountTasks(JOHN_DOE_ID, JOHN_DOE_TASK_3))

        # Jane Doe Data

        context.db.session.add(
            Account(
                JANE_DOE_ID
                , 'jane.doe@mail.not'
                , 'passwd02'
                , datetime.now()
                , datetime.now()))

        context.db.session.add(
            Task(
                JANE_DOE_TASK_1
                , 'Jane Doe Task #1'
                , 'Jane Doe Task #1 Description'
                , datetime.now()
                , datetime.now()
                , JANE_DOE_ID))
        context.db.session.add(
            Task(
                JANE_DOE_TASK_2
                , 'Jane Doe Task #2'
                , 'Jane Doe Task #2 Description'
                , datetime.now()
                , datetime.now()
                , JANE_DOE_ID))

        context.db.session.add(AccountTasks(JANE_DOE_ID, JANE_DOE_TASK_1))
        context.db.session.add(AccountTasks(JANE_DOE_ID, JANE_DOE_TASK_2))

        context.db.session.commit()


def after_scenario(context, scenario):
    from src.domain.accounts import Account
    from src.domain.tasks import AccountTasks, Task

    with context.app.app_context():

        account_tasks_result = context.db.session.query(AccountTasks).all()
        for entry in account_tasks_result:
            context.db.session.delete(entry)

        accounts_result = context.db.session.query(Account).all()
        for entry in accounts_result:
            context.db.session.delete(entry)

        tasks_result = context.db.session.query(Task).all()
        for entry in tasks_result:
            context.db.session.delete(entry)

        context.db.session.commit()
