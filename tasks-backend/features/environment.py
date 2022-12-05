import os
from behave import fixture, use_fixture

from src.domain import DatabaseProvider


@fixture
def trailmania_server(context, timeout=30, **kwargs):
    try:
        print('Starting Trailmania Server')  # TODO: Change this to a log

        os.environ['APP_CONFIG_FILE'] = 'integration_test.py'

        from src.app import app

        context.app = app
        context.client = app.test_client()
        context.db = DatabaseProvider().get()
        yield context.client
    finally:
        os.remove('instance/integration_tests.sqlite')

        print('Closing Trailmania Server')  # TODO: Change this to a log


tagged_fixtures = {
    'fixture.trailmania.server': trailmania_server
}


def before_tag(context, tag):
    fixture_function = tagged_fixtures.get(tag)
    if fixture_function is None:
        raise LookupError("Unknown fixture %s" % tag)
    use_fixture(fixture_function, context, timeout=10)


def before_scenario(context, scenario):
    from src.domain.example import Person

    print('Before %s ' % scenario.name)
    with context.app.app_context():
        context.db.session.add(Person('Rodrigo', 'Rosa', 30))
        context.db.session.add(Person('Joana', 'Caetano', 25))
        context.db.session.commit()
    # Load the data into the database


def after_scenario(context, scenario):
    from src.domain.example import Person

    print('After %s' % scenario.name)
    with context.app.app_context():
        result = context.db.session.query(Person).all()
        for entry in result:
            print('First Name: ' + entry.first_name + ', Last Name: ' + entry.last_name + ', Age: ' + str(entry.age))
            context.db.session.delete(entry)
        context.db.session.commit()
