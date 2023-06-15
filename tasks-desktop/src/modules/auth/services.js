const { Validators } = require("../../shared/utils/utils");
const { AuthRepository, AuthToken } = require("./data");
const { AccountServices } = require("../accounts/services");
const { AuthRPC } = require("./rpc");
const { Errors } = require("../../shared/errors/errors");
const { EventBus, Event, EventType } = require("../../shared/event-bus");

class AuthServices {

    constructor(accountServices, authRepository, authRPC) {
        this.accountServices = accountServices;
        this.authRepository = authRepository;
        this.authRPC = authRPC;
    }

    async login(unitOfWork, principal) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(principal.email, "No email provided");
    
        const account = await this.accountServices.getAccount(unitOfWork, principal.email);
    
        let authToken = undefined;
        if (account != undefined) {
            authToken = await this.authRepository.getAuthToken(unitOfWork, account.id);
        }
    
        if (authToken == undefined) {
            const loginResult = await this.authRPC.login(principal);
            if (loginResult.hasOwnProperty('status')) {
                throw new Errors.LoginFailedError('Failed to login account');
            }
            
            authToken = new AuthToken(
                loginResult.token
                , loginResult.refresh_token
                , loginResult.account_id
                , loginResult.expires_at)
    
            if (account == undefined) {
                await this.accountServices.create(
                    unitOfWork
                    , {
                        id: authToken.accountId
                        , email: principal.email
                    });
            }
            await this.authRepository.persistAuthToken(unitOfWork, authToken);
    
            EventBus.publish(
                new Event(
                    EventType.LOGIN_SUCCESS
                    , {
                        access_token: authToken.token
                        , account_id: authToken.accountId
                     }));
        }
    }
    
    async refresh(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "Account id cannot be empty");
    
        const oldAuthToken = await this.authRepository.getAuthToken(unitOfWork, accountId);
        if (oldAuthToken == undefined) {
            throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
        }
    
        const refreshResult = await this.authRPC.refresh(oldAuthToken.token, oldAuthToken.refreshToken)
        if (refreshResult.hasOwnProperty("status") && 
            (refreshResult.status == "404") || refreshResult.status == "401") {
                await this.authRepository.eraseAuthSessionsForAccount(unitOfWork, accountId);
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
    
        await this.authRepository.persistAuthToken(unitOfWork, authToken);
    
        EventBus.publish(new Event(EventType.REFRESH_SUCCESS, {}));
    
        return authToken;
    }
    
    async logout(unitOfWork, authSession) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(authSession, "No auth session provided");
    
        await this.authRepository.eraseAuthSessionsForAccount(unitOfWork, authSession.accountId)
        await this.authRPC.logout(authSession.token);
    
        EventBus.publish(new Event(EventType.LOGOUT_SUCCESS, {}));
    }
    
    async getActiveSession(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        return await this.authRepository.getActiveSession(unitOfWork);
    }
}

module.exports.AuthServices = new AuthServices(AccountServices, AuthRepository, AuthRPC);