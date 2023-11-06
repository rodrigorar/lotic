const { v4 } = require("uuid");
const { EventType, EventSubscriber, EventBus } = require("../../../../src/domain/shared/event-bus");
const { Account } = require("../../../../src/domain/modules/accounts");
const { AuthToken, UseCaseSignOut } = require("../../../../src/domain/modules/auth");
const { Errors } = require("../../../../src/domain/errors");

describe("[Auth]: Test Logout Use Case", () => {
    
    it("Should succeed logging out", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseForAccountId = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedLogoutGateway = jest.fn();
        mockedLogoutGateway.call = jest.fn((accessToken) => { /* Do Nothing */ });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const eventSubscriberId = v4();
        EventBus.register(
            EventType.LOGOUT_SUCCESS
            , new EventSubscriber(eventSubscriberId, (event) => {
                expect(event).not.toBeUndefined();
            }));

        const underTest = UseCaseSignOut(mockedAuthRepository, mockedLogoutGateway);
        await underTest.execute(unitOfWork, authSession);

        expect(mockedAuthRepository.eraseForAccountId.mock.calls).toHaveLength(1);
        expect(mockedLogoutGateway.call.mock.calls).toHaveLength(1);

        EventBus.unregister(EventType.LOGIN_SUCCESS, eventSubscriberId);
    });

    it("Should fail, auth repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseForAccountId = jest.fn((unitOfWork, accountId) => { throw new Error(); });
        
        const mockedLogoutGateway = jest.fn();
        mockedLogoutGateway.call = jest.fn((accessToken) => { /* Do Nothing */ });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = UseCaseSignOut(mockedAuthRepository, mockedLogoutGateway);
        expect(underTest.execute(unitOfWork, authSession)).rejects.toThrow(Error);
    });

    it("Should fail, remote call error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.eraseForAccountId = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedLogoutGateway = jest.fn();
        mockedLogoutGateway.call = jest.fn((accessToken) => { throw new Error(); });

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = UseCaseSignOut(mockedAuthRepository, mockedLogoutGateway);
        expect(underTest.execute(unitOfWork, authSession)).rejects.toThrow(Error);
    });

    it("Should fail, not unit of work provided", async () => {
        const accountId = v4();

        const mockedAuthRepository = jest.fn();
        const mockedLogoutGateway = jest.fn();

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());

        const underTest = UseCaseSignOut(mockedAuthRepository, mockedLogoutGateway);
        expect(underTest.execute(undefined, authSession)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();

        const mockedAuthRepository = jest.fn();
        const mockedLogoutGateway = jest.fn();

        const underTest = UseCaseSignOut(mockedAuthRepository, mockedLogoutGateway);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
