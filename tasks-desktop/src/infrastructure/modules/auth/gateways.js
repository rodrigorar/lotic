const { Client, BASE_URL, ContentTypes, Headers } = require("../../http/client");
const { Logger } = require("../../../domain/shared/logger");
const { Gateway } = require("../../../domain/shared/ports");

const BASE_PATH = BASE_URL + "/auth";

async function doCall(operation) {
    try {
        const response = await operation();
        console.log(response);
        return response;
    } catch (error) {
        console.log(error); // Logged like this because its an object
        return error.response;
    }
}

class LoginGateway extends Gateway {

    constructor() {
        super();
    }

    async call(principal) {
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
}

class RefreshGateway extends Gateway {

    constructor() {
        super();
    }

    async call(authSession) {
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

        console.log("Result:");
        console.log(result);

        return result.data;
    }
}

class LogoutGateway extends Gateway {

    constructor() {
        super();
    }

    async call(accessToken) {
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
}

module.exports.LoginGateway = LoginGateway;
module.exports.RefreshGateway = RefreshGateway;
module.exports.LogoutGateway = LogoutGateway;