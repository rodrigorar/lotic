from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from werkzeug.exceptions import HTTPException

from src.domain import ConflictError, InvalidArgumentError, NotFoundError
from src.infrastructure import AppProvider, DatabaseSessionProvider, AppConfigurations, to_json
from logging.config import fileConfig


def config_app():
    app_config = AppConfigurations()
    app_config.set_app_config(app.config)
    fileConfig(app_config.config_file())


def setup_providers(flask, db):
    from src.domain import DatabaseProvider, LogProvider

    flask.logger.setLevel(AppConfigurations().logging_level())
    LogProvider().set_logger(flask.logger)

    DatabaseProvider().set_database(db)
    DatabaseSessionProvider().set_session_provider(db)


def setup_blueprints(app_context: Flask):
    from src.infrastructure.accounts import accounts_bp
    from src.infrastructure.tasks import tasks_bp

    app_context.register_blueprint(accounts_bp)
    app_context.register_blueprint(tasks_bp)


def start(flask: Flask):
    from src.domain import DatabaseProvider
    db = DatabaseProvider().get()
    with flask.app_context():
        db.create_all()


app = Flask(__name__, instance_relative_config=True)
app.config.from_envvar('APP_CONFIG_FILE')
AppProvider().set_app(app)

config_app()
setup_providers(app, SQLAlchemy(app))
setup_blueprints(app)
print('Blueprints configured')
start(app)
print('App started')


# Generic Error Handlers

# TODO: Refactor these error handler to be easier to implement
# and less prone to errors

@app.errorhandler(Exception)
def handle_generic_error(e):
    return to_json({
        "type": "http://localhost:5000/generic_error",
        "title": "Internal Service Error",
        "status": "500",
        "detail": e.__str__
    }), 500, {'Content-Type': 'application/problem+json'}


@app.errorhandler(ConflictError)
def handle_not_found_error(e: ConflictError):
    return to_json({
        "type": "http://localhost:5000/conflict_error",
        "title": e.title,
        "status": "409",
        "details": e.details
    }), 409, {'Content-Type': 'application/problem+json'}


@app.errorhandler(NotFoundError)
def handle_not_found_error(e: NotFoundError):
    return to_json({
        "type": "http://localhost:5000/not_found_error",
        "title": e.title,
        "status": "404",
        "details": e.details
    }), 404, {'Content-Type': 'application/problem+json'}


@app.errorhandler(InvalidArgumentError)
def handle_invalid_argument_error(e: InvalidArgumentError):
    return to_json({
        "type": "http://localhost:5000/" + e.title,
        "title": e.title,
        "status": 400,
        "details": e.details
    }), 400, {'Content-Type': 'application/problem+json'}


@app.errorhandler(HTTPException)
def handle_http_error(e):
    response = e.get_response()
    response.data = to_json({
        "type": "http://localhost:5000/http_error",
        "title": e.name,
        "status": e.code,
        "details": e.description
    })
    response.content_type = "application/json"
    return response
