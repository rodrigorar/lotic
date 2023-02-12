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
    AccountRepository.loggoutAllAccounts();
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
    return await AccountRepository.getLoggedAccount();
}

module.exports.AccountServices = {
    create
    , login
    , logout
    , getAccount
    , getLoggedAccount
}