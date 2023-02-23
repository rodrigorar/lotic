const { UnitOfWork } = require("../../shared/persistence/database")

async function persistAuthToken(authToken) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'DELETE FROM auth_tokens WHERE account_id = ?'
                , [authToken.accountId]);
            await db.run(
                'INSERT INTO auth_tokens(token, refresh_token, account_id, expires_at) VALUES (?, ?, ?, ?)'
                , [authToken.token, authToken.refreshToken, authToken.accountId, authToken.expiresAt])
            db.close();
        });
}

async function getAuthToken(accountId) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult =
                await db.get(
                    'SELECT * FROM auth_tokens WHERE account_id = ?'
                    , [accountId]);

            if (queryResult == undefined) {
                return undefined
            }

            const result = new AuthToken(
                queryResult.token
                , queryResult.refresh_token
                , queryResult.account_id
                , queryResult.expires_at);
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

            const result = new AuthToken(
                queryResult.token
                , queryResult.refresh_token
                , queryResult.account_id
                , queryResult.expires_at);
            db.close();
            return result;
        });
}

async function eraseAuthSessionsForAccount(accountId) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'DELETE FROM auth_tokens WHERE account_id = ?'
                , [accountId]);
            db.close();
        });
}


class AuthToken {
    constructor(token, refreshToken, accountId, expiresAt) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.accountId = accountId;
        this.expiresAt = expiresAt;
    }
}

module.exports.AuthToken = AuthToken;

module.exports.AuthRepository = {
    persistAuthToken
    , getAuthToken
    , getActiveSession
    , eraseAuthSessionsForAccount
}