const { Validators } = require("../shared/utils");
const { AuthRepository } = require("./data");
const { AuthRPC } = require("./rpc");
 
let currentSession;


async function login(principal) {
    Validators.isNotNull(principal.email, "No email provided");

    const activeSession = await AuthRepository.getActiveAuthSession();
    if (activeSession) {
        currentSession = activeSession
        return;
    }

    console.log('AuthRPC being called');
    const authToken = await AuthRPC.login(principal);
    console.log('Calling Auth Repository');
    await AuthRepository.persistAuthSession(authToken);
    currentSession = authToken;
}

function logout(email) {
    Validators.isNotNull(email, "No email provided");
    AccountRepository.setLoginState(email, false);
}

function getActiveSession() {
    return currentSession;
}

module.exports.AuthServices = {
    login
    , logout
    , getActiveSession
}