const { UnitOfWork } = require('../shared/database');

function createAccount(id, email) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO accounts(id, email, logged_in) VALUES(?, ?, ?)`,
                [id, email, false]);
            db.close();
        });
}

function setLoginState(email, state) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `UPDATE accounts SET logged_in = ? WHERE email = ?`,
                [state, email]);
            db.close();
        });
}

async function getAccount(email) {
    await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.first('SELECT * FROM accounts WHERE email = ?', [email]);
            db.close();
            return new Account(queryResult.id, queryResult.email, queryResult.logged_in);
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
    , getAccount
}
