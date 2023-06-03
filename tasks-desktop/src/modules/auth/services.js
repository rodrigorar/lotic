const { Validators } = require("../../shared/utils/utils");
const { AuthRepository, AuthToken } = require("./data");
const { AccountServices } = require("../accounts/services");
const { AuthRPC } = require("./rpc");
const { Errors } = require("../../shared/errors/errors");
const { EventBus, Event, EventType } = require("../../shared/event-bus");
 
// DEPRECATED ////////////////////////////////////////////////////////////

async function login(principal) {
    Validators.isNotNull(principal.email, "No email provided");

    const account = await AccountServices.getAccount(principal.email);

    let authToken = undefined;
    if (account != undefined) {
        authToken = await AuthRepository.getAuthToken(account.id);
    }

    if (authToken == undefined) {
        loginResult = await AuthRPC.login(principal);
        if (loginResult.hasOwnProperty('status')) {
            throw new Errors.LoginFailedError('Failed to login account');
        }
        
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

        EventBus.publish(
            new Event(
                EventType.LOGIN_SUCCESS
                , {
                    access_token: authToken.token
                    , account_id: authToken.accountId
                 }));
    }
}

async function refresh(accountId) {
    Validators.isNotNull(accountId, "Account id cannot be empty");

    const oldAuthToken = await AuthRepository.getAuthToken(accountId);
    if (oldAuthToken == undefined) {
        throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
    }

    const refreshResult = await AuthRPC.refresh(oldAuthToken.token, oldAuthToken.refreshToken)
    if (refreshResult.hasOwnProperty("status") && 
        (refreshResult.status == "404") || refreshResult.status == "401") {
            await AuthRepository.eraseAuthSessionsForAccount(accountId);
            EventBus.publish(new Event(
                EventType.REFRESH_FAILED
                , { 
                    account_id: oldAuthToken.accountId
                    , refresh_token: oldAuthToken.refreshToken 
                }));
            return;
    }

    const authToken = new AuthToken(
        refreshResult.token
        , refreshResult.refresh_token
        , refreshResult.account_id
        , refreshResult.expires_at);

    await AuthRepository.persistAuthToken(authToken);

    EventBus.publish(new Event(EventType.REFRESH_SUCCESS, {}));

    return authToken;
}

async function logout(authSession) {
    Validators.isNotNull(authSession, "No auth session provided");

    await AuthRepository.eraseAuthSessionsForAccount(authSession.accountId)
    await AuthRPC.logout(authSession.token);

    EventBus.publish(new Event(EventType.LOGOUT_SUCCESS, {}));
}

function getActiveSession() {
    return AuthRepository.getActiveSession();
}

// DEPRECATED ////////////////////////////////////////////////////////////

class AuthServices {

    constructor(authRepository, authRPC) {
        this.authRepository = authRepository;
        this.authRPC = authRPC;
    }

    // TODO: Refactor the dependencies to use the ones provided by the class
    async login(unitOfWork, principal) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(principal.email, "No email provided");
    
        const account = await AccountServices.getAccount(unitOfWork, principal.email);
    
        let authToken = undefined;
        if (account != undefined) {
            authToken = await AuthRepository.getAuthToken(account.id);
        }
    
        if (authToken == undefined) {
            const loginResult = await AuthRPC.login(principal);
            if (loginResult.hasOwnProperty('status')) {
                throw new Errors.LoginFailedError('Failed to login account');
            }
            
            authToken = new AuthToken(
                loginResult.token
                , loginResult.refresh_token
                , loginResult.account_id
                , loginResult.expires_at)
    
            if (account == undefined) {
                await AccountServices.create(
                    unitOfWork
                    , {
                        id: authToken.accountId
                        , email: principal.email
                    });
            }
            await AuthRepository.AuthRepository.persistAuthToken(unitOfWork, authToken);
    
            EventBus.publish(
                new Event(
                    EventType.LOGIN_SUCCESS
                    , {
                        access_token: authToken.token
                        , account_id: authToken.accountId
                     }));
        }
    }
    
    // TODO: Refactor the dependencies to use the ones provided by the class
    async refresh(unitOfWork, accountId) {
        Validators.isNotNull(accountId, "Account id cannot be empty");
    
        const oldAuthToken = await AuthRepository.getAuthToken(accountId);
        if (oldAuthToken == undefined) {
            throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
        }
    
        const refreshResult = await AuthRPC.refresh(oldAuthToken.token, oldAuthToken.refreshToken)
        if (refreshResult.hasOwnProperty("status") && 
            (refreshResult.status == "404") || refreshResult.status == "401") {
                await AuthRepository.eraseAuthSessionsForAccount(accountId);
                EventBus.publish(new Event(
                    EventType.REFRESH_FAILED
                    , { 
                        account_id: oldAuthToken.accountId
                        , refresh_token: oldAuthToken.refreshToken 
                    }));
                return;
        }
    
        const authToken = new AuthToken(
            refreshResult.token
            , refreshResult.refresh_token
            , refreshResult.account_id
            , refreshResult.expires_at);
    
        await AuthRepository.persistAuthToken(authToken);
    
        EventBus.publish(new Event(EventType.REFRESH_SUCCESS, {}));
    
        return authToken;
    }
    
    // TODO: Refactor the dependencies to use the ones provided by the class
    async logout(unitOfWork, authSession) {
        Validators.isNotNull(authSession, "No auth session provided");
    
        await AuthRepository.eraseAuthSessionsForAccount(authSession.accountId)
        await AuthRPC.logout(authSession.token);

        // TODO: Delete local account information
    
        EventBus.publish(new Event(EventType.LOGOUT_SUCCESS, {}));
    }
    
    // TODO: Refactor the dependencies to use the ones provided by the class
    getActiveSession() {
        return AuthRepository.getActiveSession();
    }
}

module.exports.AuthServices = {
    AuthServices: new AuthServices(AuthRepository, AuthRPC)
    , login
    , refresh
    , logout
    , getActiveSession
}