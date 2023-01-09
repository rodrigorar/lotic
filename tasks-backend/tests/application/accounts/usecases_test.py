from datetime import datetime
import uuid

from mockito import mock, when
import pytest

from src.domain import DatabaseProvider
from src.domain.errors import InternalError
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.domain.accounts import Account, CreateAccount, GetAccount, AccountBusinessRulesProvider
from tests.application.shared import ApplicationUnitTestsBase, MockedUnitOfWorkProvider


global create_account_br
global get_account_br


class MockedAccountBusinessRulesProvider(AccountBusinessRulesProvider):

    @staticmethod
    def create_account(unit_of_work):
        return create_account_br

    @staticmethod
    def get_account(unit_of_work):
        return get_account_br


ACCOUNT_ID = uuid.uuid4()
UNKNOWN_ACCOUNT_ID = uuid.uuid4()
ACCOUNT_EMAIL = "john.doe@mail.not"
ACCOUNT_PASSWORD = "passwd01"


class TestUseCaseCreateAccount:

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_account_br
        global get_account_br

        create_account_br = mock(CreateAccount)
        get_account_br = mock(GetAccount)
        yield
        create_account_br = None
        get_account_br = None

    def test_should_succeed(self):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO

        input_value = AccountDTO(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(create_account_br).execute(...).thenReturn(ACCOUNT_ID)

        under_test = UseCaseCreateAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        result = under_test.execute(input_value)

        assert result is not None, "Result cannot be None"
        assert result == ACCOUNT_ID, "Result differs from expected"

    def test_should_fail_none_input(self):
        from src.application.accounts import UseCaseCreateAccount

        when(create_account_br).execute(...).thenReturn(ACCOUNT_ID)

        under_test = UseCaseCreateAccount(None, None)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    # br = business_rule
    def test_should_fail_create_account_br_error(self):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO

        input_value = AccountDTO(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(create_account_br).execute(...).thenRaise(InternalError("Something went wrong"))

        under_test = UseCaseCreateAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(input_value)

    def test_should_fail_dto_to_entity_error(self, setup_mocks_aspect):
        from src.application.accounts import UseCaseCreateAccount, AccountDTO

        input_value = AccountDTO(ACCOUNT_ID, None, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(create_account_br).execute(...).thenRaise(ACCOUNT_ID)

        under_test = UseCaseCreateAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(input_value)


class TestUseCaseGetAccount(ApplicationUnitTestsBase):

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_account_br
        global get_account_br

        create_account_br = mock(CreateAccount)
        get_account_br = mock(GetAccount)
        yield
        create_account_br = None
        get_account_br = None

    def test_should_succeed_with_result(self):
        from src.application.accounts import UseCaseGetAccount, AccountDTO

        result_value = Account(ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(result_value)

        under_test = UseCaseGetAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        result = under_test.execute(ACCOUNT_ID)

        assert result is not None, "Result cannot be None"

        assert result.equals(AccountDTO.from_entity(result_value)), "Not the expected account"

    def test_should_succeed_with_no_result(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(UNKNOWN_ACCOUNT_ID).thenReturn(None)

        under_test = UseCaseGetAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        result = under_test.execute(UNKNOWN_ACCOUNT_ID)

        assert result is None, "Result cannot be None"

    # br = business rule
    def test_should_fail_get_account_br_failure(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(ACCOUNT_ID).thenRaise(InternalError("Something went wrong"))

        under_test = UseCaseGetAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(ACCOUNT_ID)

    def test_should_fail_no_account_id(self):
        from src.application.accounts import UseCaseGetAccount

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(None)

        under_test = UseCaseGetAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(None)

    def test_should_fail_entity_to_dto_error(self):
        from src.application.accounts import UseCaseGetAccount

        result_value = Account(ACCOUNT_ID, None, ACCOUNT_PASSWORD, datetime.now(), datetime.now())

        when(get_account_br).execute(ACCOUNT_ID).thenReturn(result_value)

        under_test = UseCaseGetAccount(MockedUnitOfWorkProvider(), MockedAccountBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(ACCOUNT_ID)
