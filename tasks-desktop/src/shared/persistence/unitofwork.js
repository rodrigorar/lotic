const { OSMask } = require('../os/os-mask');
const { isDev } = require('../utils/utils');
const { Logger } = require('../logging/logger');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

class UnitOfWork {

    constructor() {
        this.queryManager = undefined;
        this.isInitilized = false;
    }

    async init() {
        if (! this.isInitilized) {
            // FIXME: Implement a connection manager in order the manage
            // the single connection to the database
            const databaseFile = OSMask.databaseFile(isDev);
            this.queryManager = await open({
                filename: databaseFile
                , driver: sqlite3.Database
            });
        }
    }

    async begin() {
        await this.queryManager.run("BEGIN TRANSACTION", []);
    }

    getQueryManager() {
        return this.queryManager;
    }

    async commit() {
        await this.queryManager.run("COMMIT", []);
    }

    async rollback() {
        await this.queryManager.run("ROLLBACK", []);
    }
}

async function runUnitOfWork(work) {
    let result;
    const unitOfWork = new UnitOfWork();
    await unitOfWork.init();

    console.log("Running Unit of Work");

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