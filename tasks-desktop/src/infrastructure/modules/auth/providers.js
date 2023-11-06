const { AuthRepository } = require("./repositories");
const { SignInGateway, RefreshGateway, SignOutGateway } = require("./gateways");
const { UseCaseRefresh, UseCaseGetActiveSession, UseCaseSignIn, UseCaseSignOut } = require("../../../domain/modules/auth");
const { UseCaseCreateLocalAccountProvider, UseCaseGetAccountByEmailProvider } = require("../accounts/providers");

const UseCaseSignInProvider = (() => {
    const get = () => UseCaseSignIn(
        UseCaseCreateLocalAccountProvider.get()
        , UseCaseGetAccountByEmailProvider.get()
        , AuthRepository
        , SignInGateway);
    return {
        get
    }
})();

const UseCaseRefreshProvider = (() => {
    const get = () => UseCaseRefresh(AuthRepository, RefreshGateway);
    return {
        get
    }
})();

const UseCaseSignOutProvider = (() => {
    const get = () => UseCaseSignOut(AuthRepository, SignOutGateway);
    return {
        get
    }
})();

const UseCaseGetActiveSessionProvider = (() => {
    const get = () => UseCaseGetActiveSession(AuthRepository);
    return {
        get
    }
})();

module.exports.UseCaseSignInProvider = UseCaseSignInProvider;
module.exports.UseCaseRefreshProvider = UseCaseRefreshProvider;
module.exports.UseCaseSignOutProvider = UseCaseSignOutProvider;
module.exports.UseCaseGetActiveSessionProvider = UseCaseGetActiveSessionProvider;