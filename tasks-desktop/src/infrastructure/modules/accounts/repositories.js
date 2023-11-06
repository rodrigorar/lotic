const { Account } = require("../../../domain/modules/accounts");
const { Tables, Fields } = require("../../persistence/tables");

const save = async (unitOfWork, account) => {
    const queryManager = unitOfWork.getQueryManager();
    await queryManager.run(
        `INSERT INTO ${Tables.Accounts}(${Fields.Accounts.Id}, ${Fields.Accounts.Email})`
        + `VALUES (?, ?)`
        , [account.id, account.email]);
}

const getByEmail = async (unitOfWork, email) => {
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

const get = async (unitOfWork, accountId) => {
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

module.exports.AccountRepository = {
    save
    , getByEmail
    , get
};