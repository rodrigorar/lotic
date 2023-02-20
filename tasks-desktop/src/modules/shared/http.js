const { Logger } = require('./logger');
const axios = require('axios');

const client = axios.create({
    baseURL: 'http://65.20.100.68:8080',
    timeout: 5000
});

const BASE_URL = "/api/v1"

async function doCall(httpCall) {
    try {
        return await httpCall();
    } catch (error) {
        return error;
    }
}

const get = async (path) => {
    Logger.trace(`Calling URL: #GET ${BASE_URL + path}`);

    return await doCall(() =>
        client.get(BASE_URL + path, {
            headers: {
                'Accept': 'application/json'
            }
        }));
};

const post = async (path, data) => {
    Logger.trace(`Calling URL: #POST ${BASE_URL + path} with Data: ${JSON.stringify(data)}`);

    const result = await doCall(() =>
        client.post(BASE_URL + path, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
    return result;
};

const put = async (path, data) => {
    Logger.trace(`Calling URL: #PUT ${BASE_URL + path} with Data: ${JSON.stringify(data)}`);

    return await doCall(() =>
        client.put(BASE_URL + path, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
};

const del = async (path) => {
    Logger.trace(`Calling URL: #DELETE ${BASE_URL + path}`);

    return await doCall(() =>
        client.delete(BASE_URL + path, {
            headers: {
                'Accept': 'application/json'
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