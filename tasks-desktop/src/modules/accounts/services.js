const { Validators } = require("../shared/utils");
const { AccountRepository, Account } = require("./data");

function create(accountData) {
    Validators.isNotNull(accountData, "No account data provided");

    AccountRepository
        .createAccount(
            new Account(
                accountData.id
                , accountData.email
            ))
}

async function getAccount(email) {
    Validators.isNotNull(email, "No email provided");
    return await AccountRepository.getAccount(email);
}

async function getAccountById(account_id) {
    Validators.isNotNull(account_id, "No account_id provided");
    return await AccountRepository.getAccountById(account_id);
}

module.exports.AccountServices = {
    create
    , getAccount
    , getAccountById
}