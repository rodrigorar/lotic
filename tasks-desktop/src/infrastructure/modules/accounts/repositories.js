const { Account } = require("../../../domain/modules/accounts");
const { Tables, Fields } = require("../../persistence/tables");

const save = async (unitOfWork, account) => {
    const queryManager = unitOfWork.getQueryManager();
    await queryManager.run(
        `INSERT INTO ${Tables.Accounts}(${Fields.Accounts.Id}, ${Fields.Accounts.Email}, ${Fields.Accounts.Language})`
        + `VALUES (?, ?, ?)`
        , [account.id, account.email, account.language]);
}

const getByEmail = async (unitOfWork, email) => {
    const queryManager = unitOfWork.getQueryManager();
    
    const queryResult = await queryManager.get(
        `SELECT * `
        + `FROM ${Tables.Accounts} `
        + `WHERE ${Fields.Accounts.Email} = ?`
        , [email]);
    return queryResult != undefined 
            ? new Account(queryResult.id, queryResult.email, queryResult.language) 
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
            ? new Account(queryResult.id, queryResult.email, queryResult.language) 
            : undefined;
}

const setLanguage = async (unitOfWork, accountId, language) => {
    const queryManager = unitOfWork.getQueryManager();

    await queryManager.run(
        `UPDATE ${Tables.Accounts} SET ${Fields.Accounts.Language}=? `
        + `WHERE ${Fields.Accounts.Id}=? `
        , [language, accountId]
    );
}

module.exports.AccountRepository = {
    save
    , getByEmail
    , get
    , setLanguage
};