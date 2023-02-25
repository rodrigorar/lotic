from datetime import datetime, timedelta
import uuid

from src.domain import DatabaseProvider

from behave import fixture, use_fixture

JOHN_DOE_ID = uuid.UUID("59dc6d88-d894-4d26-a2d5-dad9c57cde05")
JOHN_DOE_AUTH_TOKEN = uuid.UUID("2c924286-753c-46b8-9711-fc716606ee0c")
JOHN_DOE_REFRESH_TOKEN = uuid.UUID("dd62564a-f36a-486d-915a-3c46517847f0")
JOHN_DOE_TASK_1 = uuid.UUID("7dd8eda4-dd7e-404c-a578-84eafdad1086")
JOHN_DOE_TASK_2 = uuid.UUID("db62fd6b-b958-4cef-8efa-07dce85133b9")
JOHN_DOE_TASK_3 = uuid.UUID("30fa464f-4692-45aa-a4d2-752dc19fa0cc")

JANE_DOE_ID = uuid.UUID("065c2e09-06d0-4000-a152-e95aebd4a9ca")
JANE_DOE_AUTH_TOKEN = uuid.UUID("1e07d32c-c1b8-4228-8d2f-839963dab11c")
JANE_DOE_REFRESH_TOKEN = uuid.UUID("8d960c55-454b-481e-9eeb-1c2790ef417b")
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
    from src.application.auth import AuthSession

    with context.app.app_context():

        # Clear database

        clear_database(context)

        # John Doe Data

        context.db.session.add(
            Account(
                JOHN_DOE_ID
                , 'john.doe@mail.not'
                , 'passwd01'
                , datetime.now()
                , datetime.now()))

        context.db.session.add(
            AuthSession(
                JOHN_DOE_AUTH_TOKEN
                , str(JOHN_DOE_REFRESH_TOKEN)
                , JOHN_DOE_ID
                , datetime.now()
                , datetime.now() + timedelta(hours=1)))

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
            AuthSession(
                JANE_DOE_AUTH_TOKEN
                , str(JANE_DOE_REFRESH_TOKEN)
                , JANE_DOE_ID
                , datetime.now()
                , datetime.now() + timedelta(hours=1)))

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


def clear_database(context):
    from src.domain.accounts import Account
    from src.domain.tasks import AccountTasks, Task
    from src.application.auth import AuthSession

    context.db.session.query(AccountTasks).delete()
    context.db.session.query(Account).delete()
    context.db.session.query(AuthSession).delete()
    context.db.session.query(Task).delete()


def after_scenario(context, scenario):
    with context.app.app_context():
        clear_database(context)
        context.db.session.commit()

