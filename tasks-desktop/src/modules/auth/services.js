const { Validators } = require("../shared/utils");
const { AuthRepository } = require("./data");
const { AccountServices } = require("../accounts/services");
const { AuthRPC } = require("./rpc");
 
async function login(principal) {
    Validators.isNotNull(principal.email, "No email provided");

    const account = await AccountServices.getAccount(principal.email);

    let authToken = undefined;
    if (account != undefined) {
        authToken = await AuthRepository.getAuthToken(account.id);
    }

    if (authToken == undefined) {
        authToken = await AuthRPC.login(principal);
        console.log(authToken);

        if (account == undefined) {
            await AccountServices.create({
                id: authToken.account_id
                , email: principal.email
            });
        }
        await AuthRepository.persistAuthToken(authToken);
    }
}

function logout(email) {
    Validators.isNotNull(email, "No email provided");
    AccountRepository.setLoginState(email, false);
}

function getActiveSession() {
    return AuthRepository.getActiveSession();
}

module.exports.AuthServices = {
    login
    , logout
    , getActiveSession
}