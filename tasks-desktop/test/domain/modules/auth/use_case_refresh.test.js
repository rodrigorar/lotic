const { v4 } = require("uuid");
const { EventType, EventSubscriber, EventBus } = require("../../../../src/domain/shared/event-bus");
const { Account } = require("../../../../src/domain/modules/accounts");
const { AuthToken, UseCaseRefresh } = require("../../../../src/domain/modules/auth");
const { Errors } = require("../../../../src/domain/errors");

describe("[Auth]: Test Refresh Use Case", () => {

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

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.save = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        const result = await underTest.execute(unitOfWork, accountId);

        expect(result).not.toBeUndefined();
        expect(result.token).toBe(serverResponse.token);
        expect(result.refreshToken).toBe(serverResponse.refresh_token);
        expect(result.accountId).toBe(serverResponse.account_id);

        expect(mockedAuthRepository.getByAccountId.mock.calls).toHaveLength(1);
        expect(mockedAuthRepository.save.mock.calls).toHaveLength(1);
        expect(mockedRefreshGateway.call.mock.calls).toHaveLength(1);

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

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => undefined);
        mockedAuthRepository.save = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => serverResponse);

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Errors.UnknownAccountError);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.save = jest.fn((unitOfWork, authToken) => { /* Do Nothing */ });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => { throw new Error(); });

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);
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

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.eraseForAccountId = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_FAILED
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        const result = await underTest.execute(unitOfWork, accountId);

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

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.eraseForAccountId = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => serverResponse);

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.REFRESH_FAILED
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        const result = await underTest.execute(unitOfWork, accountId);

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

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getByAccountId = 
            jest.fn((unitOfWork, accountId) => new AuthToken(v4(), v4(), accountId, new Date()));
        mockedAuthRepository.save = jest.fn((unitOfWork, authToken) => { throw new Error(); });

        const mockedRefreshGateway = jest.fn();
        mockedRefreshGateway.call = jest.fn((token, refreshToken) => serverResponse);

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        const mockedRefreshGateway = jest.fn();

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        expect(underTest.execute(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();

        const mockedAuthRepository = jest.fn();
        const mockedRefreshGateway = jest.fn();

        const underTest = UseCaseRefresh(mockedAuthRepository, mockedRefreshGateway);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
