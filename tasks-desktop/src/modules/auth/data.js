const { UnitOfWork } = require("../../shared/persistence/database")

// DEPRECATED ////////////////////////////////////////////////////////////

async function persistAuthToken(authToken) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'DELETE FROM auth_sessions WHERE account_id = ?'
                , [authToken.accountId]);
            await db.run(
                'INSERT INTO auth_sessions(token, refresh_token, account_id, expires_at) VALUES (?, ?, ?, ?)'
                , [authToken.token, authToken.refreshToken, authToken.accountId, authToken.expiresAt])
            db.close();
        });
}

async function getAuthToken(accountId) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult =
                await db.get(
                    'SELECT * FROM auth_sessions WHERE account_id = ?'
                    , [accountId]);

            if (queryResult == undefined) {
                return undefined
            }

            const result = new AuthToken(
                queryResult.token
                , queryResult.re// DEPRECATED ////////////////////////////////////////////////////////////fresh_token
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
                    'SELECT * FROM auth_sessions LIMIT 1'
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
                'DELETE FROM auth_sessions WHERE account_id = ?'
                , [accountId]);
            db.close();
        });
}

// DEPRECATED ////////////////////////////////////////////////////////////


class AuthRepository {

    async persistAuthToken(unitOfWork, authToken) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            'DELETE FROM auth_sessions WHERE account_id = ?'
            , [authToken.accountId]);
        await queryManager.run(
            'INSERT INTO auth_sessions(token, refresh_token, account_id, expires_at) VALUES (?, ?, ?, ?)'
            , [authToken.token, authToken.refreshToken, authToken.accountId, authToken.expiresAt])
    }
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
    AuthRepository: new AuthRepository()
    , persistAuthToken
    , getAuthToken
    , getActiveSession
    , eraseAuthSessionsForAccount
}