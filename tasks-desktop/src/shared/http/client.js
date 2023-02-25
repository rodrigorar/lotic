const { default: axios } = require("axios");


const client = axios.create({
    baseURL: 'http://65.20.100.68:8080',
    timeout: 5000
});

// Logging filters

client.interceptors.request.use(contents => {
    console.log(contents);
    return contents;
});

client.interceptors.response.use(contents => {
    console.log(contents);
    return contents;
}, error => {
    console.log(error);
    return error;
})

module.exports.Client = client;
module.exports.BASE_URL = "/api/v1"

const Headers = {
    XAuthorization: 'X-Authorization'
    , ContentType: 'Content-Type'
    , Accept: 'Accept'
}

const ContentTypes = {
    ApplicationJson: 'application/json'
}

module.exports.Headers = Headers;
module.exports.ContentTypes = ContentTypes;