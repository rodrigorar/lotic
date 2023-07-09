const { Validators } = require("../../shared/utils");
const { Command, Query } = require("../../shared/ports");

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
        await this.accountsRepository.save(unitOfWork, newAccount);
    }
    
}

class UseCaseGetAccount extends Query {

    constructor(accountsRepository) {
        super();

        this.accountsRepository = accountsRepository;
    }

    async execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No accountId provided");

        return await this.accountRepository.get(unitOfWork, accountId);
    }
}

class UseCaseGetAccountByEmail extends Query {
    
    constructor(accountsRepository) {
        super();

        this.accountsRepository = accountsRepository;
    }
    
    async execute(unitOfWork, email) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(email, "No email provided");

        return await this.accountsRepository.getByEmail(unitOfWork, email);
    }
}

module.exports.Account = Account;
module.exports.UseCaseCreateAccount = UseCaseCreateAccount;
module.exports.UseCaseGetAccount = UseCaseGetAccount;
module.exports.UseCaseGetAccountByEmail = UseCaseGetAccountByEmail;