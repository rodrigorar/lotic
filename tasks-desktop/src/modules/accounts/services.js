const { Validators } = require("../../domain/shared/utils");
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
}

module.exports.AccountServices = AccountServices;
module.exports.AccountServicesInstance = new AccountServices(AccountRepository);
