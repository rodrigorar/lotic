const { Validators } = require("../../shared/utils");
const { Command } = require("../../shared/ports");

class Account {
    constructor(id, email) {
        this.id = id;
        this.email = email;
    }
}

class UseCaseCreateAccount extends Command {

    constructor(accountsRepository) {
        super();
        
        this.accountsRepository = accountsRepository;
    }

    async execute(unitOfWork, accountData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountData, "No account data provided");

        const newAccount = new Account(accountData.id, accountData.email);
        await this.accountsRepository.createAccount(unitOfWork, newAccount);
    }
    
}

module.exports.Account = Account;
module.exports.UseCaseCreateAccount = UseCaseCreateAccount;