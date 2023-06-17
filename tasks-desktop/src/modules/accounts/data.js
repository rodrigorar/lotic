const { Tables, Fields } = require('../../shared/persistence/tables');

class AccountRepository {

    async createAccount(unitOfWork, account) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.Accounts}(${Fields.Accounts.Id}, ${Fields.Accounts.Email})`
            + `VALUES (?, ?)`
            , [account.id, account.email]);
    }

    async getAccount(unitOfWork, email) {
        const queryManager = unitOfWork.getQueryManager();
        
        const queryResult = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.Accounts} `
            + `WHERE ${Fields.Accounts.Email} = ?`
            , [email]);
        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }

    async getAccountById(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.Accounts} `
            + `WHERE ${Fields.Accounts.Id} = ?`
            , [accountId]);

        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }
}

class Account {
    constructor(id, email) {
        this.id = id;
        this.email = email;
    }
}

module.exports.Account = Account;
module.exports.AccountRepository = new AccountRepository();
