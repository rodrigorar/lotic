const { Validators } = require("../../shared/utils/utils");
const { AuthRepository, AuthToken } = require("./data");
const { AccountServices } = require("../accounts/services");
const { AuthRPC } = require("./rpc");
const { Errors } = require("../../shared/errors/errors");
 
async function login(principal) {
    Validators.isNotNull(principal.email, "No email provided");

    const account = await AccountServices.getAccount(principal.email);

    let authToken = undefined;
    if (account != undefined) {
        authToken = await AuthRepository.getAuthToken(account.id);
    }

    if (authToken == undefined) {
        loginResult = await AuthRPC.login(principal);
        authToken = new AuthToken(
            loginResult.token
            , loginResult.refresh_token
            , loginResult.account_id
            , loginResult.expires_at)

        if (account == undefined) {
            await AccountServices.create({
                id: authToken.accountId
                , email: principal.email
            });
        }
        await AuthRepository.persistAuthToken(authToken);
    }
}

async function refresh(accountId) {
    Validators.isNotNull(accountId, "Account id cannot be empty");

    const oldAuthToken = await AuthRepository.getAuthToken(accountId);
    if (oldAuthToken == undefined) {
        throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
    }

    const refreshResult = await AuthRPC.refresh(oldAuthToken.refreshToken)
    if (refreshResult.hasOwnProperty('status') && refreshResult.status == '404') {
        // TODO: Eventually this needs to notify the user so that we don't log them 
        // out of nowhere.
        await AuthRepository.eraseAuthSessionsForAccount(accountId);
    }

    const authToken = new AuthToken(
        refreshResult.token
        , refreshResult.refresh_token
        , refreshResult.account_id
        , refreshResult.expires_at);

    await AuthRepository.persistAuthToken(authToken);

    return authToken;
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
    , refresh
    , logout
    , getActiveSession
}