from datetime import datetime
import uuid

from mockito import mock, when
import pytest

from src.domain import DatabaseProvider
from src.domain.errors import InternalError
from tests.shared import MockDatabase

DatabaseProvider().set_database(MockDatabase())

from src.domain.users import CreateUser, GetUser, UserBusinessRulesProvider
from tests.application.shared import ApplicationUnitTestsBase, MockedUnitOfWorkProvider


global create_user_br
global get_user_br


class MockedUserBusinessRulesProvider(UserBusinessRulesProvider):

    @staticmethod
    def create_user(unit_of_work):
        return create_user_br

    @staticmethod
    def get_user(unit_of_work):
        return get_user_br


USER_ID = uuid.uuid4()
USER_EMAIL = "john.doe@mail.not"
USER_PASSWORD = "passwd01"


class TestUseCaseCreateUser:

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_user_br
        global get_user_br

        create_user_br = mock(CreateUser)
        get_user_br = mock(GetUser)
        yield
        create_user_br = None
        get_user_br = None

    def test_should_succeed(self):
        from src.application.users import UseCaseCreateUser, UserDTO

        input_value = UserDTO(USER_ID, USER_EMAIL, USER_PASSWORD, datetime.now(), datetime.now())

        when(create_user_br).execute(...).thenReturn(USER_ID)

        under_test = UseCaseCreateUser(MockedUnitOfWorkProvider(), MockedUserBusinessRulesProvider())
        result = under_test.execute(input_value)

        assert result is not None, "Result cannot be None"
        assert result == USER_ID, "Result differs from expected"

    def test_should_fail_none_input(self):
        from src.application.users import UseCaseCreateUser

        when(create_user_br).execute(...).thenReturn(USER_ID)

        under_test = UseCaseCreateUser(None, None)
        with pytest.raises(AssertionError):
            under_test.execute(None)

    # br = business_rule
    def test_should_fail_create_user_br_error(self):
        from src.application.users import UseCaseCreateUser, UserDTO

        input_value = UserDTO(USER_ID, USER_EMAIL, USER_PASSWORD, datetime.now(), datetime.now())

        when(create_user_br).execute(...).thenRaise(InternalError("Something went wrong"))

        under_test = UseCaseCreateUser(MockedUnitOfWorkProvider(), MockedUserBusinessRulesProvider())
        with pytest.raises(InternalError):
            under_test.execute(input_value)

    def test_should_fail_dto_to_entity_error(self, setup_mocks_aspect):
        from src.application.users import UseCaseCreateUser, UserDTO

        input_value = UserDTO(USER_ID, None, USER_PASSWORD, datetime.now(), datetime.now())

        when(create_user_br).execute(...).thenRaise(USER_ID)

        under_test = UseCaseCreateUser(MockedUnitOfWorkProvider(), MockedUserBusinessRulesProvider())
        with pytest.raises(AssertionError):
            under_test.execute(input_value)


class TestUseCaseGetUser(ApplicationUnitTestsBase):

    @pytest.fixture(autouse=True)
    def setup_mocks_aspect(self):
        global create_user_br
        global get_user_br

        create_user_br = mock(CreateUser)
        get_user_br = mock(GetUser)
        yield
        create_user_br = None
        get_user_br = None

    def test_should_succeed_with_result(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_succeed_with_result is not implemented.")

    def test_should_succeed_with_no_result(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_succeed_with_no_result is not implemented.")

    # br = business rule
    def test_should_fail_get_user_br_failure(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_fail_business_rule_failre is not implemented.")

    def test_should_fail_no_user_id(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_fail_no_user_id is not implemented.")

    def test_should_fail_dto_to_entity_error(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_fail_dto_to_entity_error is not implemented.")

    def test_should_fail_entity_to_dto_error(self):
        raise NotImplementedError("TestUseCaseGetUser#test_should_fail_entity_to_dto is not implemented.")
