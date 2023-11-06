const { UseCaseCreateLocalAccount } = require("../../../../src/domain/modules/accounts");
const { NullArgumentError } = require("../../../../src/domain/errors");
const { v4 } = require("uuid");

describe("[Accounts]: Test Create Local Account Use Case", () => {

    it("Should Succeed with Account Creation", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const unitOfWork = jest.fn();
        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = UseCaseCreateLocalAccount(mockedAccountRepository);
        await underTest.execute(unitOfWork, accountData);

        expect(mockedAccountRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should Fail Account Repository Error", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn(async (unitOfWork, account) => { throw new Error("Some error") });

        const unitOfWork = jest.fn();
        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = UseCaseCreateLocalAccount(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, accountData)).rejects.toThrow(Error);
    });

    it("Should Fail no Unit Of Work provided", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const accountData = {
            id: v4()
            , email: "test.mail@mail.not"
        }
        const underTest = UseCaseCreateLocalAccount(mockedAccountRepository);
        expect(underTest.execute(undefined, accountData)).rejects.toThrow(NullArgumentError);
    });

    it("Should Fail no Account Data provided", async () => {
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.save = jest.fn((unitOfWork, account) => { /* Do nothing */ });

        const unitOfWork = jest.fn();
        const underTest = UseCaseCreateLocalAccount(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(NullArgumentError);
    });
});