const { UnitOfWork } = require("../shared/database")

async function persistAuthToken(authToken) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'DELETE FROM auth_tokens WHERE account_id = ?'
                , [authToken.account_id]);
            await db.run(
                'INSERT INTO auth_tokens(token, account_id) VALUES (?, ?)'
                , [authToken.token, authToken.account_id])
            db.close();
        });
}

async function getAuthToken(account_id) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult =
                await db.get(
                    'SELECT * FROM auth_tokens WHERE account_id = ?'
                    , [account_id]);

            if (queryResult == undefined) {
                return undefined
            }
            
            const result = new AuthToken(queryResult.token, queryResult.account_id);
            db.close();
            return result
        });
}

async function getActiveSession() {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult =
                await db.get(
                    'SELECT * FROM auth_tokens LIMIT 1'
                    , []);
            
            if (queryResult == undefined) {
                return undefined
            }

            const result = new AuthToken(queryResult.token, queryResult.account_id);
            db.close();
            return result;
        });
}


class AuthToken {
    constructor(token, account_id, expires_at) {
        this.token = token
        this.account_id = account_id
        this.expires_at = expires_at
    }
}

module.exports.AuthRepository = {
    persistAuthToken
    , getAuthToken
    , getActiveSession
}