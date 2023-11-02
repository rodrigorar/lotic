const { UseCaseProvider } = require("../../../domain/shared/ports");
const { 
    UseCaseCreateAccount
    , UseCaseCreateLocalAccount
    , UseCaseGetAccount
    , UseCaseGetAccountByEmail 
} = require("../../../domain/modules/accounts/domain");
const { CreateAccountGateway } = require("../accounts/gateways");
const { AccountRepositoryImpl } = require("./adapters");

class UseCaseCreateAccountProvider extends UseCaseProvider {

    get() {
        return UseCaseCreateAccount(new AccountRepositoryImpl(), new CreateAccountGateway());
    }
}

class UseCaseCreateLocalAccountProvider extends UseCaseProvider {
    
    get() {
        return UseCaseCreateLocalAccount(new AccountRepositoryImpl());
    }
}

class UseCaseGetAccountProvider extends UseCaseProvider {

    get() {
        return UseCaseGetAccount(new AccountRepositoryImpl());
    }
}

class UseCaseGetAccountByEmailProvider extends UseCaseProvider {

    
    get() {
        return UseCaseGetAccountByEmail(new AccountRepositoryImpl());
    }
}

module.exports.UseCaseCreateAccountProvider = new UseCaseCreateAccountProvider();
module.exports.UseCaseCreateLocalAccountProvider = new UseCaseCreateLocalAccountProvider();
module.exports.UseCaseGetAccountProvider = new UseCaseGetAccountProvider();
module.exports.UseCaseGetAccountByEmailProvider = new UseCaseGetAccountByEmailProvider();