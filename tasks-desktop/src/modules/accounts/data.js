const { UnitOfWork } = require('../shared/database');

async function createAccount(id, email) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO accounts(id, email, logged_in) VALUES(?, ?, ?)`
                , [id, email, false]);
            db.close();
        });
}

async function setLoginState(email, state) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `UPDATE accounts SET logged_in = ? WHERE email = ?`
                , [state, email]);
            db.close();
        });
}

async function loggoutAllAccounts() {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `UPDATE accounts SET logged_in = false WHERE logged_in IS true`
                , []);
            db.close();
        });
}

async function getAccount(email) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.get(
                'SELECT * FROM accounts WHERE email = ?'
                , [email]);
            const result = new Account(queryResult.id, queryResult.email, queryResult.logged_in == 1);
            db.close();
            return result
        });
}

async function getLoggedAccount() {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.get(
                'SELECT * FROM accounts WHERE logged_in is true'
                , []);
            const result = new Account(queryResult.id, queryResult.email, queryResult.logged_in == 1);
            db.close();
            return result;
        });
}

class Account {
    constructor(id, email, logged_in) {
        this.id = id;
        this.email = email;
        this.logged_in = logged_in;
    }
}

module.exports.Account = Account
module.exports.AccountRepository = {
    createAccount
    , setLoginState
    , loggoutAllAccounts
    , getAccount
    , getLoggedAccount
}

