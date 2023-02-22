const { HttpClient } = require("../../shared/http/http");

const BASE_PATH = "/auth";

async function login(principal) {
    const result = await HttpClient.post(BASE_PATH + "/login", {
        subject: principal.email
        , secret: principal.password
    });
    return result.data;
}

async function logout(principal) {

}

module.exports.AuthRPC = {
    login
    , logout
}