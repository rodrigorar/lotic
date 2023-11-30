const { Validators } = require("../shared/utils");
const { EventBus, EventType, Event } = require("../shared/event-bus");

class Account {
    constructor(id, email, language) {
        this.id = id;
        this.email = email;
        this.language = language;
    }
}

const UseCaseCreateLocalAccount = (accountsRepository) => {
    async function execute(unitOfWork, accountData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountData, "No account data provided");

        // FIXME: The language should come from the systems language
        const newAccount = new Account(accountData.id, accountData.email, 'en');
        await accountsRepository.save(unitOfWork, newAccount);
    }

    return {
        execute
    }
}

const UseCaseCreateAccount = (accountsRepository, createAccountGateway) => {
    async function execute(unitOfWork, accountData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountData, "No account data provided");

        try {
            const result = await createAccountGateway.call(accountData);

            // FIXME: The language should come from the server information
            const newAccount = new Account(result.id, accountData.email, 'en');
            await accountsRepository.save(unitOfWork, newAccount);

            EventBus.publish(new Event(EventType.SIGN_UP_SUCCESS, {}));
        } catch (error) {
            EventBus.publish(new Event(EventType.SIGN_UP_FAILURE, {
                message: "Failed to create account"
            }));
            throw error;
        }
    }

    return {
        execute
    }
}

const UseCaseGetAccount = (accountsRepository) => {
    async function execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No accountId provided");

        return await accountsRepository.get(unitOfWork, accountId);
    }

    return {
        execute
    }
}

const UseCaseGetAccountByEmail = (accountsRepository) => {
    async function execute(unitOfWork, email) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(email, "No email provided");

        return await accountsRepository.getByEmail(unitOfWork, email);
    }

    return {
        execute
    }
}

module.exports.Account = Account;
module.exports.UseCaseCreateLocalAccount = UseCaseCreateLocalAccount;
module.exports.UseCaseCreateAccount = UseCaseCreateAccount;
module.exports.UseCaseGetAccount = UseCaseGetAccount;
module.exports.UseCaseGetAccountByEmail = UseCaseGetAccountByEmail;