const { Validators } = require("../shared/utils");
const { AccountRepository, Account } = require("./data");

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

async function getAccount(email) {
    Validators.isNotNull(email, "No email provided");
    return await AccountRepository.getAccount(email);
}

async function getLoggedAccount() {
    // TODO: This account should be the logged in account in the database
    return new Account('d02e1b3b-014c-47a9-ab73-fa2b3366088e', 'rodrigo.ra.rosa@gmail.com', true);
}

// TODO: Use service utils of all implemented services

module.exports.AccountServices = {
    create
    , login
    , logout
    , getAccount
    , getLoggedAccount
}