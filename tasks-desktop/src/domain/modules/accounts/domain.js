const { Validators } = require("../../shared/utils");
const { Command, Query } = require("../../shared/ports");
const { EventBus, EventType, Event } = require("../../shared/event-bus");

class Account {
    constructor(id, email) {
        this.id = id;
        this.email = email;
    }
}

class UseCaseCreateLocalAccount extends Command {

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

// CONTINUE HERE

// TODO: Create Unit tests for this use case
class UseCaseCreateAccount extends Command {

    constructor(accountsRepository, createAccountGateway) {
        super();
        
        this.accountsRepository = accountsRepository;
        this.createAccountGateway = createAccountGateway;
    }

    async execute(unitOfWork, accountData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountData, "No account data provided");

        try {
            const result = await this.createAccountGateway.call(accountData);

            const newAccount = new Account(result.id, accountData.email);
            await this.accountsRepository.save(unitOfWork, newAccount);

            EventBus.publish(new Event(EventType.SIGN_UP_SUCCESS, {}));
        } catch (error) {
            EventBus.publish(new Event(EventType.SIGN_UP_FAILURE, {
                message: "Failed to create account"
            }));
        }
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

        return await this.accountsRepository.get(unitOfWork, accountId);
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
module.exports.UseCaseCreateLocalAccount = UseCaseCreateLocalAccount;
module.exports.UseCaseCreateAccount = UseCaseCreateAccount;
module.exports.UseCaseGetAccount = UseCaseGetAccount;
module.exports.UseCaseGetAccountByEmail = UseCaseGetAccountByEmail;