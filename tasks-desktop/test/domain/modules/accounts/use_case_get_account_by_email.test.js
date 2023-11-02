const { v4 } = require("uuid");
const { Account, UseCaseGetAccountByEmail } = require("../../../../src/domain/modules/accounts/domain");
const { Errors } = require("../../../../src/domain/errors");

describe("[Accounts]: Test GetAccount By Email Service", () => {

    it("Should Succeed Get Account", async () => {
        const accountId = v4();
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getByEmail = 
            jest.fn(async (unitOfWork, email) => { 
                return new Account(accountId, accountEmail);
            });
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccountByEmail(mockedAccountRepository);
        const result = await underTest.execute(unitOfWork, accountEmail);

        expect(result).not.toBeNull();
        expect(result.id).toBe(accountId);
        expect(result.email).toBe(accountEmail);

        expect(mockedAccountRepository.getByEmail.mock.calls).toHaveLength(1);
    });

    it("Should Succeed No Account Found", async () => {
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getByEmail = 
            jest.fn(async (unitOfWork, email) => { 
                return undefined;
            });
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccountByEmail(mockedAccountRepository);
        const result = await underTest.execute(unitOfWork, accountEmail);
        
        expect(result).toBeUndefined();
    });

    it("Should Fail Repository Error", async () => {
        const accountId = v4();
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        mockedAccountRepository.getByEmail = jest.fn(async (unitOfWork, email) => { throw new Error() });
        
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccountByEmail(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, accountEmail)).rejects.toThrow(Error);
    });

    it("Should Fail No Unit Of Work", async () => {
        const accountEmail = "test@mail.not";

        const mockedAccountRepository = jest.fn();
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccountByEmail(mockedAccountRepository);
        expect(underTest.execute(undefined, accountEmail)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should Fail No Email", async () => {
        const mockedAccountRepository = jest.fn();
        const unitOfWork = jest.fn();

        const underTest = UseCaseGetAccountByEmail(mockedAccountRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
