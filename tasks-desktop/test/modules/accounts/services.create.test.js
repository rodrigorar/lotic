const { v4 } = require("uuid");
const { AccountServices } = require("../../../src/modules/accounts/services");
const { Errors } = require("../../../src/shared/errors/errors");

describe("Test Create Account Service", () => {

    it("Should Succeed with Account Creation", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.createAccount = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const unitOfWork = jest.fn();
        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = new AccountServices(mockedAccountRepository);
        await underTest.create(unitOfWork, accountData);

        expect(mockedAccountRepository.createAccount.mock.calls).toHaveLength(1);
    });

    it("Should Fail Account Repository Error", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.createAccount = jest.fn(async (unitOfWork, account) => { throw new Error("Some error") });

        const unitOfWork = jest.fn();
        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.create(unitOfWork, accountData)).rejects.toThrow(Error);
    });

    it("Should Fail no Unit Of Work provided", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.createAccount = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.create(undefined, accountData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should Fail no Account Data provided", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.createAccount = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const unitOfWork = jest.fn();
        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.create(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});