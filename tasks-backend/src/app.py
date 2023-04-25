from datetime import datetime
import uuid

from flask_sqlalchemy import SQLAlchemy
from flask import Flask, g, request
from werkzeug.exceptions import HTTPException

from src.application.errors import AuthorizationError, InvalidAuthorizationError, LoginFailedError
from src.domain import ConflictError, InvalidArgumentError, LogProvider, NotFoundError
from src.infrastructure import AppProvider, DatabaseSessionProvider, AppConfigurations, to_json
from logging.config import fileConfig


def config_app(flask):
    app_config = AppConfigurations()
    app_config.set_app_config(flask.config)
    fileConfig(app_config.config_file())
    flask.secret_key = app_config.secret_key()


def setup_providers(flask, db):
    from src.domain import DatabaseProvider, LogProvider

    flask.logger.setLevel(AppConfigurations().logging_level())
    LogProvider().set_logger(flask.logger)

    DatabaseProvider().set_database(db)
    DatabaseSessionProvider().set_session_provider(db)


def setup_blueprints(app_context: Flask):
    from src.infrastructure.accounts import accounts_bp
    from src.infrastructure.tasks import tasks_bp
    from src.infrastructure.auth import auth_bp

    app_context.register_blueprint(accounts_bp)
    app_context.register_blueprint(tasks_bp)
    app_context.register_blueprint(auth_bp)


def start(flask: Flask):
    from src.domain import DatabaseProvider
    db = DatabaseProvider().get()
    with flask.app_context():
        db.create_all()


app = Flask(__name__, instance_relative_config=True)
app.config.from_envvar('APP_CONFIG_FILE')
AppProvider().set_app(app)

config_app(app)
setup_providers(app, SQLAlchemy(app))
setup_blueprints(app)
start(app)


# Authorization code

@app.before_request
def authorization_constructor():
    from src.infrastructure import UnitOfWorkProviderImpl
    from src.application.auth import AuthorizationContext
    from src.infrastructure.auth import AuthTokenStorageImpl

    authorization_token = request.headers.get('X-Authorization')
    if authorization_token is not None:
        unit_of_work_provider = UnitOfWorkProviderImpl()
        with unit_of_work_provider.get() as unit_of_work:
            auth_session = AuthTokenStorageImpl().find_by_id(unit_of_work, uuid.UUID(authorization_token))

            if auth_session is None:
                raise InvalidAuthorizationError("Unknown session token")
            elif auth_session.expires_at < datetime.now() and 'auth' not in request.path:
                raise AuthorizationError("Session token is expired")
            else:
                AuthorizationContext.create_context(
                    authorization_token
                    , auth_session.refresh_token
                    , auth_session.get_account_id())

# Healthcheck


@app.get("/health")
def health():
    return {"status": "alive"}, 200, {"Content-Type": "application/json"}


# Generic Error Handlers

# TODO: Refactor these error handler to be easier to implement
# and less prone to errors

@app.errorhandler(Exception)
def handle_generic_error(e):
    return to_json({
        "type": "http://localhost:5000/generic_error"
        , "title": "Internal Service Error"
        , "status": "500"
        , "detail": e.__str__
    }), 500, {'Content-Type': 'application/problem+json'}


@app.errorhandler(ConflictError)
def handle_not_found_error(e: ConflictError):
    return to_json({
        "type": "http://localhost:5000/conflict_error"
        , "title": e.title
        , "status": "409"
        , "details": e.details
    }), 409, {'Content-Type': 'application/problem+json'}


@app.errorhandler(NotFoundError)
def handle_not_found_error(e: NotFoundError):
    return to_json({
        "type": "http://localhost:5000/not_found_error"
        , "title": e.title
        , "status": "404"
        , "details": e.details
    }), 404, {'Content-Type': 'application/problem+json'}


@app.errorhandler(LoginFailedError)
def handle_login_failed_error(e: LoginFailedError):
    return to_json({
        "type": "http://localhost:5000/login_failed_error"
        , "title": e.title
        , "status": "401"
        , "details": e.details
    }), 401, {'Content-Type': 'application/problem+json'}


@app.errorhandler(InvalidAuthorizationError)
def handle_login_failed_error(e: InvalidAuthorizationError):
    return to_json({
        "type": "http://localhost:5000/invalid_authorization_error"
        , "title": e.title
        , "status": "401"
        , "details": e.details
    }), 401, {'Content-Type': 'application/problem+json'}


@app.errorhandler(AuthorizationError)
def handle_authorization_error(e: AuthorizationError):
    return to_json({
        "type": "http://localhost:5000/authorization_error"
        , "title": e.title
        , "status": "403"
        , "details": e.details
    }), 403, {'Content-Type': 'application/problem+json'}


@app.errorhandler(InvalidArgumentError)
def handle_invalid_argument_error(e: InvalidArgumentError):
    return to_json({
        "type": "http://localhost:5000/" + e.title
        , "title": e.title
        , "status": 400
        , "details": e.details
    }), 400, {'Content-Type': 'application/problem+json'}


@app.errorhandler(HTTPException)
def handle_http_error(e):
    response = e.get_response()
    response.data = to_json({
        "type": "http://localhost:5000/http_error"
        , "title": e.name
        , "status": e.code
        , "details": e.description
    })
    response.content_type = "application/json"
    return response
