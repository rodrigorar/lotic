const { default: axios } = require("axios");
const { AppConfig } = require("../configs");


const client = axios.create({
    baseURL: AppConfig.serverURL
    , timeout: 5000
});

// Logging filters

// client.interceptors.request.use(contents => {
//     console.log(contents);
//     return contents;
// });

// client.interceptors.response.use(contents => {
//     console.log(contents);
//     return contents;
// }, error => {
//     console.log(error);
//     return error;
// })

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