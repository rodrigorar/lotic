const { OSMask } = require("../os/os-mask");
const { isDev } = require("../../domain/shared/utils");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const OpenTx = (() => {
    let queryManager = undefined;
    let references = 0;

    const init = async () => {
        if (queryManager == undefined) {
            const databaseFile = OSMask.databaseFile(isDev);
            queryManager = await open({
                filename: databaseFile
                , driver: sqlite3.Database
            });
        }
    }

    const addReference = () => {
        references++;
    }

    const removeReference = () => {
        references = references === 0 ? 0 : references - 1;
    }

    const getReferences = () => {
        return references;
    }

    const getQueryManager = () => {
        return queryManager;
    }

    return {
        init
        , addReference
        , removeReference
        , getReferences
        , getQueryManager
    }
})();

const UnitOfWork = () => {

    const init = async () => await OpenTx.init()

    const begin = async () => {
        if (OpenTx.getReferences() === 0) {
            await OpenTx.getQueryManager().run("BEGIN TRANSACTION", []);
        }
        OpenTx.addReference();
    }

    const getQueryManager = () => {
        return OpenTx.getQueryManager();
    }

    const commit = async () => {
        if (OpenTx.getReferences() === 1) {
            await OpenTx.getQueryManager().run("COMMIT", []);
        }
        OpenTx.removeReference();
    }

    const rollback = async () => {
        if (OpenTx.getReferences() === 1) {
            await OpenTx.getQueryManager().run("ROLLBACK", []);
        }
        OpenTx.removeReference();
    }

    return {
        init
        , begin
        , getQueryManager
        , commit
        , rollback
    }
}

async function runUnitOfWork(work) {
    let result;
    const unitOfWork = UnitOfWork();
    await unitOfWork.init();

    try {
        await unitOfWork.begin();
        result = await work(unitOfWork);
        await unitOfWork.commit();
    } catch (error) {
        console.log(error);
        await unitOfWork.rollback();
    }

    return result;
}

module.exports.UnitOfWork = UnitOfWork;
module.exports.RunUnitOfWork = {
    run: runUnitOfWork
};