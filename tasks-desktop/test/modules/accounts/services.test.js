const { v4 } = require("uuid");
const { AccountServices } = require("../../../src/modules/accounts/services");
const { Account } = require("../../../src/modules/accounts/data");
const { Errors } = require("../../../src/shared/errors/errors");

describe("[Accounts]: Test Create Service", () => {

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

describe("[Accounts]: Test GetAccount Service", () => {

    it("Should Succeed Get Account", async () => {
        const accountId = v4();
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccount = 
            jest.fn(async (unitOfWork, email) => { 
                return new Account(accountId, accountEmail);
            });
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        const result = await underTest.getAccount(unitOfWork, accountEmail);

        expect(result).not.toBeNull();
        expect(result.id).toBe(accountId);
        expect(result.email).toBe(accountEmail);
    });

    it("Should Succeed No Account Found", async () => {
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccount = 
            jest.fn(async (unitOfWork, email) => { 
                return undefined;
            });
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        const result = await underTest.getAccount(unitOfWork, accountEmail);
        
        expect(result).toBeUndefined();
    });

    it("Should Fail Repository Error", async () => {
        const accountId = v4();
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccount = jest.fn(async (unitOfWork, email) => { throw new Error() });
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccount(unitOfWork, accountEmail)).rejects.toThrow(Error);
    });

    it("Should Fail No Unit Of Work", async () => {
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccount(undefined, accountEmail)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should Fail No Email", async () => {
        const mockedAccountRepository = jest.fn();
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccount(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });

});

describe("[Accounts]: Test GetAccountById Service", () => {

    it("Should Succeed Get Account By Id", async () => {
        throw new Error("Should Succeed Get Account By Id is not implemented");
    });

    it("Should Succeed No Account Found", async () => {
        throw new Error("Should Succeed No Account Found is not implemented");
    });

    it("Should Fail Account Repository Error", async () => {
        throw new Error("Should Fail Account Repository Error is not implemented");
    });

    it("Should Fail No Unit Of Work", async () => {
        throw new Error("Should Fail No Unit Of Work is not implemented");
    });

    it("Should Fail No Account Id", async () => {
        throw new Error("Should Fail No Account Id is not implemented");
    });
});