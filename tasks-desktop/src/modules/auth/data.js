const { UnitOfWork } = require("../shared/database")

async function persistAuthSession(authToken) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'INSERT INTO auth_sessions(token, account_id, expires_at) VALUES(?, ?, ?)'
                , [authToken.token, authToken.account_id, authToken.expires_at])
            db.close();
        });
}

async function getActiveAuthSession(account_id) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult =
                db.run(
                    'SELECT token, account_id FROM auth_sessions WHERE account_id = ? AND expires_at > ?'
                    , [account_id, new Date()])

            if (queryResult.token == undefined) {
                return undefined
            }
            
            const result = new AuthToken(queryResult.token, queryResult.account_id, queryResult.expires_at);
            db.close();
            return result
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
    persistAuthSession
    , getActiveAuthSession
}