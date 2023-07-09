const { AccountsRepository } = require("../../../domain/modules/accounts/ports");
const { Account } = require("../../../domain/modules/accounts/domain");

class AccountRepositoryImpl extends AccountsRepository {

    // FIXME: In order to be a proper save it needs to support the update as well. 
    async save(unitOfWork, account) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.Accounts}(${Fields.Accounts.Id}, ${Fields.Accounts.Email})`
            + `VALUES (?, ?)`
            , [account.id, account.email]);
    }

    async getByEmail(unitOfWork, email) {
        const queryManager = unitOfWork.getQueryManager();
        
        const queryResult = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.Accounts} `
            + `WHERE ${Fields.Accounts.Email} = ?`
            , [email]);
        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }

    async get(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();

        const queryResult = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.Accounts} `
            + `WHERE ${Fields.Accounts.Id} = ?`
            , [accountId]);

        return queryResult != undefined 
                ? new Account(queryResult.id, queryResult.email) 
                : undefined;
    }
}