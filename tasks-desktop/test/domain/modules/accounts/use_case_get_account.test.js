const { v4 } = require("uuid");
const { Account, UseCaseGetAccount } = require("../../../../src/domain/modules/accounts");
const { Errors } = require("../../../../src/domain/errors");

describe("[Accounts]: Test GetAccount By Id Service", () => {

    it("Should Succeed Get Account By Id", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.get = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccount(mockedAccountRepository);
        const result = await underTest.execute(unitOfWork, accountId);

        expect(result).not.toBeNull();
        expect(result.id).toBe(accountId);
        expect(result.email).toBe(email);

        expect(mockedAccountRepository.get.mock.calls).toHaveLength(1);
    });

    it("Should Succeed No Account Found", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.get = 
            jest.fn(async (unitOfWork, accountId) => undefined);
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccount(mockedAccountRepository);
        const result = await underTest.execute(unitOfWork, accountId);

        expect(result).toBeUndefined();
    });

    it("Should Fail Account Repository Error", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.get = 
            jest.fn(async (unitOfWork, accountId) => { throw new Error() });
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccount(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);
    });

    it("Should Fail No Unit Of Work", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.get = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const underTest = UseCaseGetAccount(mockedAccountRepository);
        expect(underTest.execute(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should Fail No Account Id", async () => {
        const accountId = v4();
        const email = "test@mail.not";
        
        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.get = 
            jest.fn(async (unitOfWork, accountId) => 
                new Account(accountId, email));
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccount(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});