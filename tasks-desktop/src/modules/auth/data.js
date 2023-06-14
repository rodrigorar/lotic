
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

    async getAuthToken(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult =
            await queryManager.get(
                'SELECT * FROM auth_sessions WHERE account_id = ?'
                , [accountId]);

        if (queryResult == undefined) {
            return undefined
        }

        return new AuthToken(
            queryResult.token
            , queryResult.refresh_token
            , queryResult.account_id
            , queryResult.expires_at);
    }

    async getActiveSession(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult =
            await queryManager.get(
                'SELECT * FROM auth_sessions LIMIT 1'
                , []);
    
        if (queryResult == undefined) {
            return undefined
        }

        return new AuthToken(
            queryResult.token
            , queryResult.refresh_token
            , queryResult.account_id
            , queryResult.expires_at);
    }

    async eraseAuthSessionsForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        
        await queryManager.run(
            'DELETE FROM auth_sessions WHERE account_id = ?'
            , [accountId]);
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
module.exports.AuthRepository = new AuthRepository();