const { Validators } = require("../../shared/utils/utils");
const { AccountRepository, Account } = require("./data");

class AccountServices {

    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }

    async create(unitOfWork, accountData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountData, "No account data provided");

        const newAccount = new Account(accountData.id, accountData.email);
        await this.accountRepository.createAccount(unitOfWork, newAccount);
    }

    async getAccount(unitOfWork, email) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(email, "No email provided");

        return await this.accountRepository.getAccount(unitOfWork, email);
    }

    async getAccountById(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No accountId provided");

        return await this.accountRepository.getAccountById(unitOfWork, accountId);
    }

    // DEPRECATED Functions ---> 03/06/2023

    // DEPRECATED: 03/06/2023
    async create(accountData) {
        Validators.isNotNull(accountData, "No account data provided");

        await this.accountRepository
            .createAccount(new Account(accountData.id, accountData.email));
    }

    // DEPRECATED: 03/06/2023
    async getAccount(email) {
        Validators.isNotNull(email, "No email provided");

        return await this.accountRepository.getAccount(email);
    }

    // DEPRECATED: 03/06/2023
    async getAccountById(accountId) {
        Validators.isNotNull(accountId, "No accountId provided");

        return await this.accountRepository.getAccountById(accountId);
    }
}

module.exports.AccountServices = new AccountServices(AccountRepository);
