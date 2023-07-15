const { Validators } = require("../../shared/utils");
const { EventBus, Event, EventType } = require("../../shared/event-bus");
const { Command, Query } = require("../../shared/ports");
const { Errors } = require("../../errors");

class AuthToken {
    constructor(token, refreshToken, accountId, expiresAt) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.accountId = accountId;
        this.expiresAt = expiresAt;
    }
}

class UseCaseLogin extends Command {

    constructor(useCaseCreateAccount, useCaseGetAccountByEmail, authRepository, loginGateway) {
        super();

        this.useCaseCreateAccount = useCaseCreateAccount;
        this.useCaseGetAccountByEmail = useCaseGetAccountByEmail;
        this.authRepository = authRepository;
        this.loginGateway = loginGateway;
    }

    async execute(unitOfWork, principal) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(principal, "No principal provided");
    
        const account = await this.useCaseGetAccountByEmail.execute(unitOfWork, principal.email);

        let authToken = undefined;
        if (account != undefined) {
            authToken = await this.authRepository.getByAccountId(unitOfWork, account.id);
        }
    
        if (authToken == undefined) {
            const loginResult = await this.loginGateway.call(principal);
            if (loginResult.hasOwnProperty('status')) {
                // FIXME: Inform the user in case this happens
                throw new Errors.LoginFailedError('Failed to login account');
            }
            authToken = new AuthToken(
                loginResult.token
                , loginResult.refresh_token
                , loginResult.account_id
                , loginResult.expires_at)
    
            if (account == undefined) {
                await this.useCaseCreateAccount.execute(
                    unitOfWork
                    , {
                        id: authToken.accountId
                        , email: principal.email
                    });
            }
            await this.authRepository.save(unitOfWork, authToken);
    
            EventBus.publish(
                new Event(
                    EventType.LOGIN_SUCCESS
                    , {
                        access_token: authToken.token
                        , account_id: authToken.accountId
                     }));
        }
    }
}

class UseCaseRefresh extends Command {

    constructor(authRepository, refreshGateway) {
        super();

        this.authRepository = authRepository;
        this.refreshGateway = refreshGateway;
    }

    async execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "Account id cannot be empty");
    
        const oldAuthToken = await this.authRepository.getByAccountId(unitOfWork, accountId);
        if (oldAuthToken == undefined) {
            throw new Errors.UnknownAccountError("No session found for account id: " + accountId);
        }
    
        const refreshResult = await this.refreshGateway.call(oldAuthToken.token, oldAuthToken.refreshToken)
        if (refreshResult.hasOwnProperty("status") && 
            (refreshResult.status == "404") || refreshResult.status == "401") {
                await this.authRepository.eraseForAccountId(unitOfWork, accountId);
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
    
        await this.authRepository.save(unitOfWork, authToken);
    
        EventBus.publish(new Event(EventType.REFRESH_SUCCESS, {}));
    
        return authToken;
    }
}

class UseCaseLogout extends Command {

    constructor(authRepository, logoutGateway) {
        super();

        this.authRepository = authRepository;
        this.logoutGateway = logoutGateway;
    }

    async execute(unitOfWork, authSession) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(authSession, "No auth session provided");
    
        await this.authRepository.eraseForAccountId(unitOfWork, authSession.accountId)
        await this.logoutGateway.call(authSession.token);
    
        EventBus.publish(new Event(EventType.LOGOUT_SUCCESS, {}));
    }
}

class UseCaseGetActiveSession extends Query {

    constructor(authRepository) {
        super();

        this.authRepository = authRepository;
    }

    async execute(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        return await this.authRepository.getActiveSession(unitOfWork);
    }
}

module.exports.AuthToken = AuthToken;
module.exports.UseCaseLogin = UseCaseLogin;
module.exports.UseCaseRefresh = UseCaseRefresh;
module.exports.UseCaseLogout = UseCaseLogout;
module.exports.UseCaseGetActiveSession = UseCaseGetActiveSession;