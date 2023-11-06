const { v4 } = require("uuid");
const { AuthToken, UseCaseGetActiveSession } = require("../../../../src/domain/modules/auth");
const { Errors } = require("../../../../src/domain/errors");

describe("[Auth]: Test Get Active Session Use Case", () => {

    it("Should succeed getting active session", async () => {
        const unitOfWork = jest.fn();
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const expiresAt = new Date();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getActiveSession = jest.fn(
            (unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, expiresAt));

        const underTest = UseCaseGetActiveSession(mockedAuthRepository);
        const result = await underTest.execute(unitOfWork);

        expect(result).not.toBeUndefined();
        expect(result.token).toBe(accessToken);
        expect(result.refreshToken).toBe(refreshToken);
        expect(result.accountId).toBe(accountId);
        expect(result.expiresAt).toBe(expiresAt);

        expect(mockedAuthRepository.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, auth repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedAuthRepository = jest.fn();
        mockedAuthRepository.getActiveSession = jest.fn(
            (unitOfWork) => { throw new Error(); });

        const underTest = UseCaseGetActiveSession(mockedAuthRepository);
        expect(underTest.execute(unitOfWork)).rejects.toThrow(Error);

        expect(mockedAuthRepository.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, not unit of work provided", async () => {
        const mockedAuthRepository = jest.fn();

        const underTest = UseCaseGetActiveSession(mockedAuthRepository);
        expect(underTest.execute()).rejects.toThrow(Errors.NullArgumentError);
    });
});