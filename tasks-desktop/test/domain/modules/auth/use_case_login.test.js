const { v4 } = require("uuid");
const { EventType, EventSubscriber, EventBus } = require("../../../../src/domain/shared/event-bus");
const { Account } = require("../../../../src/domain/modules/accounts");
const { AuthToken, UseCaseSignIn } = require("../../../../src/domain/modules/auth");
const { Errors } = require("../../../../src/domain/errors");

describe("[Auth]: Test Login Use Case", () => {
    
    
    it("Should succeed Logging In", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedGetAccountByEmail = jest.fn();
        mockedGetAccountByEmail.execute = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));
        
        const mockedCreateAccountUseCase = jest.fn();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.LOGIN_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event.body.access_token).not.toBeUndefined();
                expect(event.body.account_id).toBe(accountId);
            }));

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmail
            , mockedAuthRepository
            , mockedLoginGateway);
        await underTest.execute(unitOfWork, principal);

        expect(mockedGetAccountByEmail.execute.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.getByAccountId.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.save.mock.calls).toHaveLength(1);
        expect(mockedLoginGateway.call.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should succeed non existing account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedGetAccountByEmailUseCase = jest.fn();
        mockedGetAccountByEmailUseCase.execute = jest.fn((unitOfWork, email) => { return undefined; });
        const mockedCreateAccountUseCase = jest.fn();
        mockedCreateAccountUseCase.execute = jest.fn((unitOfWork, account) => { /* Do Nothing */ })

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.LOGIN_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event.body.access_token).not.toBeUndefined();
                expect(event.body.account_id).toBe(accountId);
            }));

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmailUseCase
            ,  mockedAuthRepository
            , mockedLoginGateway);
        await underTest.execute(unitOfWork, principal);

        expect(mockedGetAccountByEmailUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedCreateAccountUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.getByAccountId.mock.calls).toHaveLength(0);
        expect(mockedAuthRepository.save.mock.calls).toHaveLength(1);
        expect(mockedLoginGateway.call.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";

        const mockedCreateAccountUseAccount = jest.fn();

        const mockedGetAccountUseCase = jest.fn();
        mockedGetAccountUseCase.execute = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => { throw new Error(); });   

        const principal = {
            email: email
            , password: password
        }

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseAccount
            , mockedGetAccountUseCase
            , mockedAuthRepository
            , mockedLoginGateway);
        expect(underTest.execute(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, error creating new local account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedCreateAccountUseCase = jest.fn();
        mockedCreateAccountUseCase.execute = jest.fn((unitOfWork, account) => { throw new Error(); })

        const mockedGetAccountByEmailUseCase = jest.fn();
        mockedGetAccountByEmailUseCase.execute = jest.fn((unitOfWork, email) => { return undefined; });

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmailUseCase
            , mockedAuthRepository
            , mockedLoginGateway);
        expect(underTest.execute(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, error persisting new token", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedCreateAccountUseCase = jest.fn();

        const mockedGetAccountByEmailUseCase = jest.fn();
        mockedGetAccountByEmailUseCase.execute = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { throw new Error(); });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmailUseCase
            , mockedAuthRepository
            , mockedLoginGateway);
        expect(underTest.execute(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedCreateAccountUseCase = jest.fn();

        const mockedGetAccountByEmail = jest.fn();
        mockedGetAccountByEmail.execute = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.call = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmail
            , mockedAuthRepository
            , mockedLoginGateway);
        expect(underTest.execute(undefined, principal)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no principal provided", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const access_token = v4();
        const refresh_token = v4();

        const mockedCreateAccountUseCase = jest.fn();

        const mockedGetAccountByEmailUseCase = jest.fn();
        mockedGetAccountByEmailUseCase.execute = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.save = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedLoginGateway = jest.fn();
        mockedLoginGateway.execute = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const underTest = UseCaseSignIn(
            mockedCreateAccountUseCase
            , mockedGetAccountByEmailUseCase
            , mockedAuthRepository
            , mockedLoginGateway);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
