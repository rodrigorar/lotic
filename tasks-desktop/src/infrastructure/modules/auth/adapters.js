const { Tables, Fields } = require("../../persistence/tables");
const { AuthRepository } = require("../../../domain/modules/auth/data");

class AuthRepositoryImpl extends AuthRepository {

    // FIXME: This should be able to deal with updates as well
    async save(unitOfWork, authToken) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE `
            + `FROM ${Tables.AuthSessions} `
            + `WHERE ${Fields.AuthSessions.AccountId} = ?`
            , [authToken.accountId]);
        await queryManager.run(
            `INSERT INTO ${Tables.AuthSessions}` 
                + `(${Fields.AuthSessions.AccessToken}, ${Fields.AuthSessions.RefreshToken}, ${Fields.AuthSessions.AccountId}, ${Fields.AuthSessions.ExpiresAt})`
                + `VALUES (?, ?, ?, ?)`
            , [authToken.token, authToken.refreshToken, authToken.accountId, authToken.expiresAt])
    }    

    async getByAccountId(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult =
            await queryManager.get(
                `SELECT * `
                + `FROM ${Tables.AuthSessions} `
                + `WHERE ${Fields.AuthSessions.AccountId} = ?`
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
                `SELECT * `
                + `FROM ${Tables.AuthSessions} `
                + `LIMIT 1`
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

    async eraseForAccountId(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        
        await queryManager.run(
            `DELETE FROM ${Tables.AuthSessions} WHERE ${Fields.AuthSessions.AccountId} = ?`
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
module.exports.AuthRepositoryImpl = AuthRepositoryImpl;