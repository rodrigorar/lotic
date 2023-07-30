const { Logger } = require("../../../domain/shared/logger");
const { Gateway } = require("../../../domain/shared/ports");
const { BASE_URL, Client, Headers, ContentTypes } = require("../../http/client");

const BASE_PATH = BASE_URL + "/accounts";

async function doCall(operation) {
    try {
        return await operation();
    } catch (error) {
        console.log(error);
        Logger.error(error.response);
        throw error;
    }
}

class CreateAccountGateway extends Gateway {

    constructor() {
        super();
    }

    async call(accountData) {
        Logger.trace(`Calling URL: #POST ${BASE_PATH}/accounts`);

        const result = await doCall(async () => {
            return await Client.post(
                BASE_PATH
                , {
                    email: accountData.email
                    , password: accountData.password
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

module.exports.CreateAccountGateway = CreateAccountGateway;
