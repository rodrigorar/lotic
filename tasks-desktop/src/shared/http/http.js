const { Logger } = require('../logging/logger');
const { AuthServices } = require('../../modules/auth/services');
const { Client, BASE_URL, Headers, ContentTypes } = require('./client');

async function doCall(httpCall) {
    const activeSession = await AuthServices.getActiveSession();
    try {
        return await httpCall(activeSession.token);
    } catch (error) {
        if (error.response.status == StatusCode.Unauthorized) {
            // TODO: Abstract Auth Services from here, this is deeply wrong
            await AuthServices.refresh(activeSession.accountId);

            const newActiveSession = await AuthServices.getActiveSession();
            try {
                return await httpCall(newActiveSession.token);
            } catch (error) {
                return error;
            }
        }
        return error;
    }
}

const get = async (path) => {
    Logger.trace(`Calling URL: #GET ${BASE_URL + path}`);
    return await doCall((authToken) =>
        Client.get(BASE_URL + path, {
            headers: {
                [Headers.Accept]: [ContentTypes.ApplicationJson]
                , [Headers.XAuthorization]: authToken
            }
        }));
};

// TODO: Improve the autorization code, so we don't hve to add it to every request

const post = async (path, data) => {
    Logger.trace(`Calling URL: #POST ${BASE_URL + path} with Data: ${JSON.stringify(data)}`);

    const result = await doCall((authToken) =>
        Client.post(BASE_URL + path, data, {
            headers: {
                [Headers.ContentType]: [ContentTypes.ApplicationJson]
                , [Headers.Accept]: [ContentTypes.ApplicationJson]
                , [Headers.XAuthorization]: authToken
            }
        }));
    return result;
};

const put = async (path, data) => {
    Logger.trace(`Calling URL: #PUT ${BASE_URL + path} with Data: ${JSON.stringify(data)}`);

    return await doCall((authToken) =>
        Client.put(BASE_URL + path, data, {
            headers: {
                [Headers.ContentType]: [ContentTypes.ApplicationJson]
                , [Headers.Accept]: [ContentTypes.ApplicationJson]
                , [Headers.XAuthorization]: authToken
            }
        }));
};

const del = async (path) => {
    Logger.trace(`Calling URL: #DELETE ${BASE_URL + path}`);

    return await doCall((authToken) =>
        Client.delete(BASE_URL + path, {
            headers: {
                [Headers.Accept]: [ContentTypes.ApplicationJson]
                , [Headers.XAuthorization]: authToken
            }
        }));
};

module.exports.HttpClient = {
    get,
    post,
    put,
    del
}

const StatusCode = {
    Ok: 200
    , Created: 201
    , NoContent: 204
    , BadRequest: 400
    , Unauthorized: 401
    , Forbidden: 403
    , NotFound: 404
    , NotAcceptable: 406
    , Conflict: 409
    , ServerError: 500
    , BadGateway: 504
}

module.exports.StatusCode = StatusCode;