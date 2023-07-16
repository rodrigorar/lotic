const { v4 } = require("uuid");
const { AccountServices } = require("../../../src/modules/accounts/services");
const { Account } = require("../../../src/modules/accounts/data");
const { Errors } = require("../../../src/domain/errors");

describe("[Accounts]: Test GetAccountById Service", () => {

    it("Should Succeed Get Account By Id", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccountById = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        const result = await underTest.getAccountById(unitOfWork, accountId);

        expect(result).not.toBeNull();
        expect(result.id).toBe(accountId);
        expect(result.email).toBe(email);
    });

    it("Should Succeed No Account Found", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccountById = 
            jest.fn(async (unitOfWork, accountId) => undefined);
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        const result = await underTest.getAccountById(unitOfWork, accountId);

        expect(result).toBeUndefined();
    });

    it("Should Fail Account Repository Error", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccountById = 
            jest.fn(async (unitOfWork, accountId) => { throw new Error() });
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccountById(unitOfWork, accountId)).rejects.toThrow(Error);
    });

    it("Should Fail No Unit Of Work", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccountById = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccountById(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should Fail No Account Id", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getAccountById = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const unitOfWork = jest.fn();

        const underTest = new AccountServices(mockedAccountRepository);
        expect(underTest.getAccountById(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});