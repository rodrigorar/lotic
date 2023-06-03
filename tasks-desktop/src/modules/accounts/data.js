const { UnitOfWork } = require('../../shared/persistence/database');
const { Tables } = require('../../shared/persistence/tables');

class AccountRepository {

    async createAccount(unitOfWork, account) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.ACCOUNTS}(id, email) VALUES (?, ?)`
            , [account.id, account.email]);
    }

    async getAccount(unitOfWork, email) {
        const queryManager = unitOfWork.getQueryManager();
        
        const queryResult = await queryManager.get(
            'SELECT * FROM accounts WHERE email = ?'
            , [email]);

        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }

    async getAccountById(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult = await db.get(
            'SELECT * FROM accounts WHERE id = ?'
            , [accountId]);

        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }

    // DEPRECATED Functions ---> 03/06/2023

    // FIXME: The unit of work should be provided and not be done here
    async createAccount(account) {
        await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO ${Tables.ACCOUNTS}(id, email) VALUES(?, ?)`
                , [account.id, account.email]);
            db.close();
        });
    }

    // FIXME: The unit of work should be provided and not be done here
    async getAccount(email) {
        return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.get(
                'SELECT * FROM accounts WHERE email = ?'
                , [email]);
            const result = 
                queryResult != undefined 
                    ? new Account(queryResult.id, queryResult.email) 
                    : undefined;
            db.close();
            return result
        });
    }

    // FIXME: The unit of work should be provided and not be done here
    async getAccountById(accountId) {
        return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.get(
                'SELECT * FROM accounts WHERE id = ?'
                , [accountId]);
            const result = 
                queryResult != undefined 
                    ? new Account(queryResult.id, queryResult.email) 
                    : undefined;
            db.close();
            return result
        });
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
