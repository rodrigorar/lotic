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
    }
}

const get = async (url) => {
    return await doCall(() => 
        client.get(url, {
            headers: {
                'Accept': 'application/json'
            }
        }));
};

const post = async (url, data) => {
    return await doCall(() =>
        client.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
};

const put = async (url, data) => {
    return await doCall(() => 
        client.put(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }));
};

const del = async (url) => {
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