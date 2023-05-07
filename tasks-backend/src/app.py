from datetime import datetime
import uuid

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_openapi3 import OpenAPI, Info
from flask import __version__, Flask, g, request
from werkzeug.exceptions import HTTPException

from src.application.errors import AuthorizationError, InvalidAuthorizationError, LoginFailedError
from src.domain import ConflictError, InvalidArgumentError, LogProvider, NotFoundError
from src.infrastructure import AppProvider, DatabaseSessionProvider, AppConfigurations, to_json
from logging.config import fileConfig

from src.infrastructure.error_handlers import configure_error_handlers


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


def setup_blueprints(app_context: OpenAPI):
    from src.infrastructure.accounts import accounts_bp
    from src.infrastructure.tasks import tasks_bp
    from src.infrastructure.auth import auth_bp

    app_context.register_api(accounts_bp)
    app_context.register_api(tasks_bp)
    app_context.register_api(auth_bp)


def start(flask: Flask):
    from src.domain import DatabaseProvider
    db = DatabaseProvider().get()

    Migrate(app, db)

    with flask.app_context():
        db.create_all()


app = OpenAPI(
    __name__
    , info=Info(title="Tasks Backend", version=__version__)
    , instance_relative_config=True)

app.config.from_envvar('APP_CONFIG_FILE')
AppProvider().set_app(app)

config_app(app)
setup_providers(app, SQLAlchemy(app))
setup_blueprints(app)
configure_error_handlers(app)
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
