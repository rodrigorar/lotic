const { UseCaseProvider } = require("../../../domain/shared/ports");
const { UseCaseCreateAccount, UseCaseGetAccount, UseCaseGetAccountByEmail } = require("../../../domain/modules/accounts/domain");
const { AccountRepositoryImpl } = require("./adapters");

class UseCaseCreateAccountProvider extends UseCaseProvider {

    get() {
        return new UseCaseCreateAccount(new AccountRepositoryImpl());
    }
}

class UseCaseGetAccountProvider extends UseCaseProvider {

    get() {
        return new UseCaseGetAccount(new AccountRepositoryImpl());
    }
}

class UseCaseGetAccountByEmailProvider extends UseCaseProvider {

    
    get() {
        return new UseCaseGetAccountByEmail(new AccountRepositoryImpl());
    }
}

module.exports.UseCaseCreateAccountProvider = new UseCaseCreateAccountProvider();
module.exports.UseCaseGetAccountProvider = new UseCaseGetAccountProvider();
module.exports.UseCaseGetAccountByEmailProvider = new UseCaseGetAccountByEmailProvider();