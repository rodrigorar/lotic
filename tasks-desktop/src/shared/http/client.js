const { default: axios } = require("axios");


const client = axios.create({
    baseURL: 'http://65.20.100.68:8080',
    timeout: 5000
});

module.exports.Client = client;
module.exports.BASE_URL = "/api/v1"