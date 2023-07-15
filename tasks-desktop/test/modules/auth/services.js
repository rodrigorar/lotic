const { v4 } = require("uuid");
const { AuthServices } = require("../../../src/modules/auth/services");
const { EventType, EventSubscriber, EventBus } = require("../../../src/shared/event-bus");
const { Account } = require("../../../src/modules/accounts/data");
const { Errors } = require("../../../src/domain/errors");
const { AuthToken } = require("../../../src/modules/auth/data");


describe("[Auth]: Test Login Service", () => {
    
    
    it("Should succeed Logging In", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
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

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        await underTest.login(unitOfWork, principal);

        expect(mockedAccountServices.getAccount.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.getAuthToken.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.persistAuthToken.mock.calls).toHaveLength(1);
        expect(mockedAuthRPC.login.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should succeed non existing account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = jest.fn((unitOfWork, email) => { return undefined; });
        mockedAccountServices.create = jest.fn((unitOfWork, account) => { /* Do Nothing */ })

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
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

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        await underTest.login(unitOfWork, principal);

        expect(mockedAccountServices.getAccount.mock.calls).toHaveLength(1);
        expect(mockedAccountServices.create.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.getAuthToken.mock.calls).toHaveLength(0);
        expect(mockedAuthRepository.persistAuthToken.mock.calls).toHaveLength(1);
        expect(mockedAuthRPC.login.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => { throw new Error(); });   

        const principal = {
            email: email
            , password: password
        }

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.login(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, error creating new local account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = jest.fn((unitOfWork, email) => { return undefined; });
        mockedAccountServices.create = jest.fn((unitOfWork, account) => { throw new Error(); })

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.login(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, error persisting new token", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { throw new Error(); });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.login(unitOfWork, principal)).rejects.toThrow(Error);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        const password = "qwerty";
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const principal = {
            email: email
            , password: password
        }

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.login(undefined, principal)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no principal provided", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const access_token = v4();
        const refresh_token = v4();

        const mockedAccountServices = jest.fn();
        mockedAccountServices.getAccount = 
            jest.fn((unitOfWork, email) => new Account(accountId, email));

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = jest.fn((unitOfWork, accountId) => { return undefined; });
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authSession) => { /* Do Nothing */ });

        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.login = jest.fn((principal) => ({
            token: access_token
            , refresh_token: refresh_token
            , account_id: accountId
            , expires_at: new Date()
        }));   

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.login(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Auth]: Test Refresh Service", () => {
    it("Should succeed Refreshing Session", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 200
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        const result = await underTest.refresh(unitOfWork, accountId);

        expect(result).not.toBeUndefined();
        expect(result.token).toBe(serverResponse.token);
        expect(result.refreshToken).toBe(serverResponse.refresh_token);
        expect(result.accountId).toBe(serverResponse.account_id);

        expect(mockedAuthRepository.getAuthToken.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.persistAuthToken.mock.calls).toHaveLength(1);
        expect(mockedAuthRPC.refresh.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, no old session found", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 200
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => undefined);
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => serverResponse);

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.refresh(unitOfWork, accountId)).rejects.toThrow(Errors.UnknownAccountError);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 200
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => { throw new Error(); });

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.refresh(unitOfWork, accountId)).rejects.toThrow(Error);
    });

    it("Should succeed, auth session not found in server", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 404
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        
        mockedAuthRepository.eraseAuthSessionsForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_FAILED
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        const result = await underTest.refresh(unitOfWork, accountId);

        expect(result).toBeUndefined();

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should succeed, auth session not authorized", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 401
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        
        mockedAuthRepository.eraseAuthSessionsForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_FAILED
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        const result = await underTest.refresh(unitOfWork, accountId);

        expect(result).toBeUndefined();

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, error persisting new token", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const serverResponse = {
            status: 200
            , token: v4()
            , refresh_token: v4()
            , account_id: accountId
            , expires_at: new Date()
        }

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getAuthToken = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.persistAuthToken = jest.fn((unitOfWork, authToken) => { throw new Error(); });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.refresh = jest.fn((token, refreshToken) => serverResponse);

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.refresh(unitOfWork, accountId)).rejects.toThrow(Error);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.refresh(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.refresh(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Auth]: Test Logout Service", () => {
    
    it("Should succeed logging out", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseAuthSessionsForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.logout = jest.fn((accessToken) => { /* Do Nothing */ });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.LOGOUT_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        await underTest.logout(unitOfWork, authSession);

        expect(mockedAuthRepository.eraseAuthSessionsForAccount.mock.calls).toHaveLength(1);
        expect(mockedAuthRPC.logout.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, auth repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseAuthSessionsForAccount = jest.fn((unitOfWork, accountId) => { throw new Error(); });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.logout = jest.fn((accessToken) => { /* Do Nothing */ });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.logout(unitOfWork, authSession)).rejects.toThrow(Error);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseAuthSessionsForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });
        const mockedAuthRPC = jest.fn();
        mockedAuthRPC.logout = jest.fn((accessToken) => { throw new Error(); });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.logout(unitOfWork, authSession)).rejects.toThrow(Error);
    });

    it("Should fail, not unit of work provided", async () => {
        const accountId = v4();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        const mockedAuthRPC = jest.fn();

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.logout(undefined, authSession)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.logout(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Auth]: Test Get Active Session Service", () => {

    it("Should succeed getting active session", async () => {
        const unitOfWork = jest.fn();
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const expiresAt = new Date();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getActiveSession = jest.fn(
            (unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, expiresAt));
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        const result = await underTest.getActiveSession(unitOfWork);

        expect(result).not.toBeUndefined();
        expect(result.token).toBe(accessToken);
        expect(result.refreshToken).toBe(refreshToken);
        expect(result.accountId).toBe(accountId);
        expect(result.expiresAt).toBe(expiresAt);

        expect(mockedAuthRepository.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, auth repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getActiveSession = jest.fn(
            (unitOfWork) => { throw new Error(); });
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.getActiveSession(unitOfWork)).rejects.toThrow(Error);

        expect(mockedAuthRepository.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, not unit of work provided", async () => {
        const mockedAccountServices = jest.fn();
        const mockedAuthRepository = jest.fn();
        const mockedAuthRPC = jest.fn();

        const underTest = new AuthServices(mockedAccountServices, mockedAuthRepository, mockedAuthRPC);
        expect(underTest.getActiveSession()).rejects.toThrow(Errors.NullArgumentError);
    });
});