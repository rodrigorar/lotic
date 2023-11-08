const { Client, BASE_URL, ContentTypes, Headers } = require("../../http/client");
const { Logger } = require("../../../domain/shared/logger");

const BASE_PATH = BASE_URL + "/auth";

async function doCall(operation) {
    try {
        const response = await operation();
        return response;
    } catch (error) {
        console.log(error); // Logged like this because its an object
        return error.response;
    }
}

const SignInGateway = (() => {
    const call = async (principal) => {
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

    return {
        call
    }
})();

const RefreshGateway = (() => {
    const call = async (authSession) => {
        Logger.trace(`Calling URL: #POST ${BASE_PATH}/refresh/${authSession.refreshToken}`);

        const result = await doCall(async () => {
            return await Client.post(
                BASE_PATH + "/refresh/" + authSession.refreshToken
                , {}
                , {
                    headers: {
                        [Headers.Accept]: ContentTypes.ApplicationJson 
                        , [Headers.XAuthorization]: authSession.token
                    }
                });
        });

        return result.data;
    }

    return {
        call
    }
})();

const SignOutGateway = (() => {
    const call = async (accessToken) => {
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

    return {
        call
    }
})();

module.exports.SignInGateway = SignInGateway;
module.exports.RefreshGateway = RefreshGateway;
module.exports.SignOutGateway = SignOutGateway;