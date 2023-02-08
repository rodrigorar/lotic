const { Validators } = require("../shared/utils");
const { AccountRepository } = require("./data");

function create(accountData) {
    Validators.isNotNull(accountData, "No account data provided");

    AccountRepository
        .createAccount(
            new Task(
                accountData.id
                , accountData.email
                , true
            ))
}

function login(email) {
    Validators.isNotNull(email, "No email provided");
    AccountRepository.setLoginState(email, true);
}

function logout(email) {
    Validators.isNotNull(email, "No email provided");
    AccountRepository.setLoginState(email, false);
}

function getAccount(email) {
    Validators.isNotNull(email, "No email provided");
    return AccountRepository.getAccount(email);
}

module.exports.AccountServices = {
    create
    , login
    , logout
    , getAccount
}