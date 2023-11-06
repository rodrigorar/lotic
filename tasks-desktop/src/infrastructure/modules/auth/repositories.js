const { Tables, Fields } = require("../../persistence/tables");
const { AuthToken } = require("../../../domain/modules/auth");

const save = async (unitOfWork, authToken) => {
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

const getByAccountId = async (unitOfWork, accountId) => {
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

const getActiveSession = async (unitOfWork) => {
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

const eraseForAccountId = async (unitOfWork, accountId) => {
    const queryManager = unitOfWork.getQueryManager();
    
    await queryManager.run(
        `DELETE FROM ${Tables.AuthSessions} WHERE ${Fields.AuthSessions.AccountId} = ?`
        , [accountId]);
}

module.exports.AuthRepository = {
    save
    , getByAccountId
    , getActiveSession
    , eraseForAccountId
};