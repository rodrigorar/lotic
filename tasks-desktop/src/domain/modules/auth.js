const { Validators } = require("../shared/utils");
const { EventBus, Event, EventType } = require("../shared/event-bus");
const { Errors } = require("../errors");

// TODO: Move this out of the folder and make it a standalone module

class AuthToken {
    constructor(token, refreshToken, accountId, expiresAt) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.accountId = accountId;
        this.expiresAt = expiresAt;
    }
}

const UseCaseSignIn = (
    useCaseCreateLocalAccount
    , useCaseGetAccountByEmail
    , authRepository
    , signInGateway) => {

        const validateUsername = (email) => {
            return email
                .toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        }
    
        const execute = async (unitOfWork, principal) => {
            Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
            Validators.isNotNull(principal, "No principal provided");
    
            if (! validateUsername(principal.email)) {
                EventBus.publish(new Event(
                    EventType.LOGIN_FAILURE
                    , {
                        message: "Invalid email"
                    }));
                throw new Errors.LoginFailedError("Invalid username");
            }
        
            const account = await useCaseGetAccountByEmail.execute(unitOfWork, principal.email);
    
            let authToken = undefined;
            if (account != undefined) {
                authToken = await authRepository.getByAccountId(unitOfWork, account.id);
            }
        
            if (authToken == undefined) {
                const loginResult = await signInGateway.call(principal);
                if (loginResult.hasOwnProperty('status')) {
                    EventBus.publish(new Event(
                        EventType.LOGIN_FAILURE
                        , {
                            message: "Username and/or Password are incorrect"
                        }));
                    throw new Errors.LoginFailedError('Failed to login account');
                }
                authToken = new AuthToken(
                    loginResult.token
                    , loginResult.refresh_token
                    , loginResult.account_id
                    , loginResult.expires_at)
        
                if (account == undefined) {
                    await useCaseCreateLocalAccount.execute(
                        unitOfWork
                        , {
                            id: authToken.accountId
                            , email: principal.email
                        });
                }
                await authRepository.save(unitOfWork, authToken);
        
                EventBus.publish(
                    new Event(
                        EventType.LOGIN_SUCCESS
                        , {
                            access_token: authToken.token
                            , account_id: authToken.accountId
                         }));
            }
        }

        return {
            execute
        }
}

const UseCaseRefresh = (authRepository, refreshGateway) => {

    const execute = async (unitOfWork, accountId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "Account id cannot be empty");
    
        const oldAuthToken = await authRepository.getByAccountId(unitOfWork, accountId);
        if (oldAuthToken == undefined) {
            throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
        }
    
        const refreshResult = await refreshGateway.call(oldAuthToken)
        if (refreshResult.hasOwnProperty("status") && 
            (refreshResult.status == "404") || refreshResult.status == "401") {
                await authRepository.eraseForAccountId(unitOfWork, accountId);
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
    
        await authRepository.save(unitOfWork, authToken);
    
        EventBus.publish(new Event(EventType.REFRESH_SUCCESS, {}));
    
        return authToken;
    }

    return {
        execute
    }
}

const UseCaseSignOut = (authRepository, signOutGateway) => {
    const execute = async (unitOfWork, authSession) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(authSession, "No auth session provided");
    
        await authRepository.eraseForAccountId(unitOfWork, authSession.accountId)
        await signOutGateway.call(authSession.token);
    
        EventBus.publish(new Event(EventType.LOGOUT_SUCCESS, {}));
    }

    return {
        execute
    }
}

const UseCaseGetActiveSession = (authRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        return await authRepository.getActiveSession(unitOfWork);
    }

    return {
        execute
    }
}

module.exports.AuthToken = AuthToken;
module.exports.UseCaseSignIn = UseCaseSignIn;
module.exports.UseCaseRefresh = UseCaseRefresh;
module.exports.UseCaseSignOut = UseCaseSignOut;
module.exports.UseCaseGetActiveSession = UseCaseGetActiveSession;