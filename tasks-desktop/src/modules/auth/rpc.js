const { Client, BASE_URL, ContentTypes, Headers } = require("../../shared/http/client");
const { Logger } = require("../../shared/logging/logger");

const BASE_PATH = BASE_URL + "/auth";

async function doCall(operation) {
    try {
        return await operation();
    } catch (error) {
        Logger.error(error.response.data);
        return error.response;
    }
}

async function login(principal) {
    Logger.trace(`Calling URL: #POST ${BASE_PATH}/login`);

    const result = await doCall(async () => {
        return await Client.post(
            BASE_PATH + "/login"
            , {
                subject: principal.email
                , secret: principal.password
            }, {
            headers: {
                [Headers.ContentType]: ContentTypes.ApplicationJson
                , [Headers.Accept]: ContentTypes.ApplicationJson
            }
        });
    });
    return result.data;
}

async function refresh(refreshToken) {
    Logger.trace(`Calling URL: #POST ${BASE_PATH}/refresh/${refreshToken}`);

    const result = await doCall(async () => {
        return await Client.post(
            BASE_PATH + "/refresh/" + refreshToken
            , {}
            , {
                headers: {
                    [Headers.ContentType]: ContentTypes.ApplicationJson
                    , [Headers.Accept]: ContentTypes.ApplicationJson 
                }
            });
    });
    return result.data;
}

async function logout(accountId) {
    Logger.trace(`Calling URL: #POST ${BASE_PATH}/logout`);

    const activeSession = await AuthServices.getActiveSession();

    const result = await doCall(async () => {
        return await Client.post(
            BASE_PATH + "/logout"
            , {
                account_id: accountId
            }
            , {
                headers: {
                    [Headers.ContentType]: ContentTypes.ApplicationJson
                    , [Headers.Accept]: ContentTypes.ApplicationJson 
                    , [Headers.XAuthorization]: activeSession.token 
                }
            });
    });
    return result.data;
}

module.exports.AuthRPC = {
    login
    , refresh
    , logout
}