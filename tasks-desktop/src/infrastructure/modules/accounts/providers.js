const { 
    UseCaseCreateAccount
    , UseCaseCreateLocalAccount
    , UseCaseGetAccount
    , UseCaseGetAccountByEmail 
} = require("../../../domain/modules/accounts");
const { CreateAccountGateway } = require("../accounts/gateways");
const { AccountRepository } = require("./repositories");

const UseCaseCreateAccountProvider = (() => {
    const get = () => UseCaseCreateAccount(AccountRepository, CreateAccountGateway);
    return {
        get
    }
})()

const UseCaseCreateLocalAccountProvider = (() => {
    const get = () => UseCaseCreateLocalAccount(AccountRepository);
    return {
        get
    }
})()

const UseCaseGetAccountProvider = (() => {
    const get = () => UseCaseGetAccount(AccountRepository);
    return {
        get
    }
})()

const UseCaseGetAccountByEmailProvider = (() => {
    const get = () => UseCaseGetAccountByEmail(AccountRepository);
    return {
        get
    }
})()

module.exports.UseCaseCreateAccountProvider = UseCaseCreateAccountProvider;
module.exports.UseCaseCreateLocalAccountProvider = UseCaseCreateLocalAccountProvider;
module.exports.UseCaseGetAccountProvider = UseCaseGetAccountProvider;
module.exports.UseCaseGetAccountByEmailProvider = UseCaseGetAccountByEmailProvider;