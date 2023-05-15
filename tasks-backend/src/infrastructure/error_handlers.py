from http.client import HTTPException

from flask_openapi3 import OpenAPI, Info
from pydantic import BaseModel, Field, ValidationError

from src.application.errors import AuthorizationError, ForbiddenError, InvalidAuthorizationError, \
    LoginFailedError
from src.domain import ConflictError, InvalidArgumentError, LogProvider, NotFoundError
from src.infrastructure import to_json


class ErrorResponse(BaseModel):
    type: str = Field(None, description="Error documentation URI")
    title: str = Field(None, description="The error title (Http Name)")
    status: str = Field(None, description="The error Http Status code")
    detail: str = Field(None, description="What caused the error")

    def __init__(self, type: str, title: str, status: str, detail: str):
        super().__init__()

        self.type = type
        self.title = title
        self.status = status
        self.detail = detail


class GenericErrorResponse(ErrorResponse):

    def __init__(self, detail: Exception):
        super().__init__(
            "http://localhost:5000/generic_error"
            , "Internal Service Error"
            , "500"
            , detail.__str__())


class ConflictResponse(ErrorResponse):

    def __init__(self, detail: str):
        super().__init__(
            "http://localhost:5000/conflict_error"
            , "Conflict"
            , "409"
            , detail)


class NotFoundResponse(ErrorResponse):

    def __init__(self, detail: str):
        super().__init__(
            "http://localhost:5000/not_found_error"
            , "Not Found"
            , "404"
            , detail)


class ForbiddenResponse(ErrorResponse):
    def __init__(self, detail: str):
        super().__init__(
            "http://localhost:5000/forbidden_error"
            , "Forbidden"
            , "403"
            , detail)

class BadRequestResponse(ErrorResponse):

    def __init__(self, detail: str):
        super().__init__(
            "http://localhost:5000/bad_request"
            , "Bad Request"
            , "400"
            , detail)


class UnauthorizedResponse(ErrorResponse):

    def __init__(self, detail: str):
        super().__init__(
            "http://localhost:5000/authorization_error"
            , "Unauthorized"
            , "401"
            , detail)


def configure_error_handlers(app: OpenAPI):

    @app.errorhandler(Exception)
    def handle_generic_error(e):
        return to_json(GenericErrorResponse(e)) \
            , 500 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(ConflictError)
    def handle_not_found_error(e: ConflictError):
        return to_json(ConflictResponse(e.details)) \
            , 409 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(NotFoundError)
    def handle_not_found_error(e: NotFoundError):
        return to_json(NotFoundResponse(e.details)) \
            , 404 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(ForbiddenError)
    def handle_forbidden_error(e: ForbiddenError):
        return to_json(ForbiddenError(e.details)) \
            , 403 \
            , {"Content-Type": "application/problem+json"}

    @app.errorhandler(LoginFailedError)
    def handle_login_failed_error(e: LoginFailedError):
        return to_json(UnauthorizedResponse(e.details)) \
            , 401 \
            , {'Content-Type': 'application/problem+json'}

    # FIXME: We should add a WWW-Authenticate header with the endpoint
    #   where the app should authenticate.
    @app.errorhandler(InvalidAuthorizationError)
    def handle_login_failed_error(e: InvalidAuthorizationError):
        return to_json(UnauthorizedResponse(e.details)) \
            , 401 \
            , {'Content-Type': 'application/problem+json'}

    # FIXME: We should add a WWW-Authenticate header with the endpoint
    #   where the app should authenticate.
    @app.errorhandler(AuthorizationError)
    def handle_authorization_error(e: AuthorizationError):
        return to_json(UnauthorizedResponse(e.details)) \
            , 401 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(InvalidArgumentError)
    def handle_invalid_argument_error(e: InvalidArgumentError):
        return to_json(BadRequestResponse(e.details)) \
            , 400 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(ValidationError)
    def handle_validation_error(e: ValidationError):
        return to_json(BadRequestResponse(e.__str__())) \
            , 400 \
            , {'Content-Type': 'application/problem+json'}

    @app.errorhandler(TypeError)
    def handle_validation_error(e: TypeError):
        return to_json(BadRequestResponse(e.__str__())) \
            , 400 \
            , {'Content-Type': 'application/problem+json'}

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