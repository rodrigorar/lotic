const { v4 } = require("uuid");
const { UseCaseCreateAccount } = require("../../../../src/domain/modules/accounts/domain");

describe("[Accounts]: Test Create Account Use Case", () => {

    it("Should succeed", async () => {
        const mockedUnitOfWork = jest.fn();
        const accountData = {
            email: "test@mail.not"
            , password: "qwerty"
        };

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => { /* Do Nothing */ });

        const mockedCreateAccountGateway = jest.fn();
        mockedCreateAccountGateway.call = jest.fn((accountData) => ({
            id: v4()
        }));

        const underTest = new UseCaseCreateAccount(mockedAccountRepository, mockedCreateAccountGateway);
        await underTest.execute(mockedUnitOfWork, accountData);
        
        expect(mockedCreateAccountGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should fail Remote Call Error", async () => {
        const mockedUnitOfWork = jest.fn();
        const accountData = {
            email: "test@mail.not"
            , password: "qwerty"
        };

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => { /* Do Nothing */ });

        const mockedCreateAccountGateway = jest.fn();
        mockedCreateAccountGateway.call = jest.fn((accountData) => {
            throw new Error();
        });

        const underTest = new UseCaseCreateAccount(mockedAccountRepository, mockedCreateAccountGateway);
        expect(underTest.execute(mockedUnitOfWork, accountData)).rejects.toThrow(Error);
        
        expect(mockedCreateAccountGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should fail Repository Error", async () => {
        const mockedUnitOfWork = jest.fn();
        const accountData = {
            email: "test@mail.not"
            , password: "qwerty"
        };

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => {
            throw new Error();
        });

        const mockedCreateAccountGateway = jest.fn();
        mockedCreateAccountGateway.call = jest.fn((accountData) => ({
            id: v4()
        }));

        const underTest = new UseCaseCreateAccount(mockedAccountRepository, mockedCreateAccountGateway);
        expect(underTest.execute(mockedUnitOfWork, accountData)).rejects.toThrow(Error);
        
        expect(mockedCreateAccountGateway.call.mock.calls).toHaveLength(1);
    });
});