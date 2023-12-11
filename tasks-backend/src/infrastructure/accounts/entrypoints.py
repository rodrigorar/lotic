import uuid

from flask_openapi3 import APIBlueprint, Tag
from pydantic import BaseModel, Field

from src.domain import LogProvider
from src.infrastructure import to_json
from src.infrastructure.accounts import CreateAccountRequest, GetAccountResponse \
    , AccountUseCaseProvider
from src.infrastructure.accounts.payloads import CreateAccountResponse, UpdateAccountRequest
from src.infrastructure.error_handlers import BadRequestResponse, ConflictResponse, \
    GenericErrorResponse, NotFoundResponse
from src.utils import URL_PREFIX_V1

logger = LogProvider().get()

accounts_bp = APIBlueprint(
    "accounts"
    , __name__
    , abp_tags=[Tag(name="Accounts", description="Accounts Operations API")]
    , url_prefix=URL_PREFIX_V1 + "/accounts"
    , doc_ui=True)


# TODO: Refactor parsing of information so that the try/except is not so explicit
@accounts_bp.post(
    ""
    , responses={
        "200": CreateAccountResponse
        , "400": BadRequestResponse
        , "409": ConflictResponse
        , "500": GenericErrorResponse
    }
)
def create_account(body: CreateAccountRequest):
    logger.info("[API - Accounts]")

    use_case = AccountUseCaseProvider.create_account()
    result = use_case.execute(body.to_dto())
    return to_json(CreateAccountResponse(result)) \
        , 200 \
        , {'Content-Type': 'application/json'}


class AccountIdPath(BaseModel):
    account_id: str = Field(None, description="Account id to obtain information of")


@accounts_bp.put(
    "/<account_id>"
    , responses={
        "204": None
        , "400": BadRequestResponse
        , "404": NotFoundResponse
        , "500": GenericErrorResponse
    }
)
def update_account(path: AccountIdPath, body: UpdateAccountRequest):
    logger.info("Endpoint: Update Account " + path.account_id)

    use_case = AccountUseCaseProvider.update_account()
    use_case.execute(body.to_dto(uuid.UUID(path.account_id)))

    return '', 204


@accounts_bp.get(
    "/<account_id>"
    , responses={
        "200": GetAccountResponse
        , "404": NotFoundResponse
        , "500": GenericErrorResponse
    }
)
def get_account(path: AccountIdPath):
    logger.info("Endpoint: Get account " + str(path.account_id))

    use_case = AccountUseCaseProvider.get_account()
    result = use_case.execute(uuid.UUID(path.account_id))

    if result is None:
        return "", 404

    return to_json(GetAccountResponse.from_dto(result)) \
        , 200 \
        , {'Content-Type': 'application/json'}
