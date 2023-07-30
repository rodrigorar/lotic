const { AuthRepositoryImpl } = require("./adapters");
const { LoginGateway, RefreshGateway, LogoutGateway } = require("./gateways");
const { UseCaseProvider } = require("../../../domain/shared/ports");
const { UseCaseLogin, UseCaseRefresh, UseCaseLogout, UseCaseGetActiveSession } = require("../../../domain/modules/auth/domain");
const { UseCaseCreateLocalAccountProvider, UseCaseGetAccountByEmailProvider } = require("../accounts/providers");

class UseCaseLoginProvider extends UseCaseProvider {

    get() {
        return new UseCaseLogin(
            UseCaseCreateLocalAccountProvider.get()
            , UseCaseGetAccountByEmailProvider.get()
            , new AuthRepositoryImpl()
            , new LoginGateway())
    }
}

class UseCaseRefreshProvider extends UseCaseProvider {

    get() {
        return new UseCaseRefresh(new AuthRepositoryImpl(), new RefreshGateway());
    }
}

class UseCaseLogoutProvider extends UseCaseProvider {

    get() {
        return new UseCaseLogout(new AuthRepositoryImpl(), new LogoutGateway());
    }
}

class UseCaseGetActiveSessionProvider extends UseCaseProvider {

    get() {
        return new UseCaseGetActiveSession(new AuthRepositoryImpl());
    }
}

module.exports.UseCaseLoginProvider = new UseCaseLoginProvider();
module.exports.UseCaseRefreshProvider = new UseCaseRefreshProvider();
module.exports.UseCaseLogoutProvider = new UseCaseLogoutProvider();
module.exports.UseCaseGetActiveSessionProvider = new UseCaseGetActiveSessionProvider();