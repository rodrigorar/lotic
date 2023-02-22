const { UnitOfWork } = require('../../shared/persistence/database');

async function createAccount(account) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO accounts(id, email) VALUES(?, ?)`
                , [account.id, account.email]);
            db.close();
        });
}

async function getAccount(email) {
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

async function getAccountById(account_id) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.get(
                'SELECT * FROM accounts WHERE id = ?'
                , [account_id]);
            const result = 
                queryResult != undefined 
                    ? new Account(queryResult.id, queryResult.email) 
                    : undefined;
            db.close();
            return result
        });
}

class Account {
    constructor(id, email) {
        this.id = id;
        this.email = email;
    }
}

module.exports.Account = Account
module.exports.AccountRepository = {
    createAccount
    , getAccount
    , getAccountById
}

