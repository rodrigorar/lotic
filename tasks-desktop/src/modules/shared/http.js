const { Logger } = require('./logger');
const axios = require('axios');

const client = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 5000
});

async function doCall(httpCall) {
    try {
        return await httpCall();
    } catch (error) {
        console.log(error.cause);
        throw error;
    }
}

const get = async (url) => {
    Logger.trace(`Calling URL: #GET ${url}`);

    return await doCall(() =>
        client.get(url, {
            headers: {
                'Accept': 'application/json'
            }
        }));
};

const post = async (url, data) => {
    Logger.trace(`Calling URL: #POST ${url} with Data: ${JSON.stringify(data)}`);

    const result = await doCall(() =>
        client.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
    return result;
};

const put = async (url, data) => {
    Logger.trace(`Calling URL: #PUT ${url} with Data: ${JSON.stringify(data)}`);

    return await doCall(() =>
        client.put(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
};

const del = async (url) => {
    Logger.trace(`Calling URL: #DELETE ${url}`);

    return await doCall(() =>
        client.delete(url, {
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