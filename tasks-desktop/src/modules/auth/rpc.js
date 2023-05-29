const { Client, BASE_URL, ContentTypes, Headers } = require("../../shared/http/client");
const { Logger } = require("../../shared/logging/logger");

const BASE_PATH = BASE_URL + "/auth";

async function doCall(operation) {
    try {
        return await operation();
    } catch (error) {
        Logger.error(error.response);
        console.log(error.response);
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

async function refresh(accessToken, refreshToken) {
    Logger.trace(`Calling URL: #POST ${BASE_PATH}/refresh/${refreshToken}`);

    const result = await doCall(async () => {
        return await Client.post(
            BASE_PATH + "/refresh/" + refreshToken
            , {}
            , {
                headers: {
                    [Headers.Accept]: ContentTypes.ApplicationJson 
                    , [Headers.XAuthorization]: accessToken
                }
            });
    });
    return result.data;
}

async function logout(accessToken) {
    Logger.trace(`Calling URL: #DELETE ${BASE_PATH}/${accessToken}`);

    await doCall(async () => {
        return await Client.delete(
            BASE_PATH + "/" + accessToken
            , {
                headers: {
                    [Headers.Accept]: ContentTypes.ApplicationJson 
                    , [Headers.XAuthorization]: accessToken
                }
            });
    });
}

module.exports.AuthRPC = {
    login
    , refresh
    , logout
}