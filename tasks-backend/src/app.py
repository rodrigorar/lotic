import logging

from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from werkzeug.exceptions import HTTPException

from src.domain.errors import NotFoundError
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
    from src.infrastructure.example import example_bp
    from src.infrastructure.user import user_bp
    from src.infrastructure.tasks import tasks_bp

    app_context.register_blueprint(example_bp)
    app_context.register_blueprint(user_bp)
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
start(app)


# Generic Error Handlers


@app.errorhandler(Exception)
def handle_generic_error(e):
    return to_json({
        "type": "http://localhost:5000/generic_error",
        "title": "Internal Service Error",
        "status": "500",
        "detail": e.__str__
    })


@app.errorhandler(NotFoundError)
def handle_not_found_error(e: NotFoundError):
    return to_json({
        "type": "http://localhost:5000/not_found_error",
        "title": e.title,
        "status": "404",
        "details": e.details
    })


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
