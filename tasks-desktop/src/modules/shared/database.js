const { OSMask } = require('./os-mask');
const { isDev } = require('./utils');
const { Logger } = require('./logger');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

let db;
begin = async () => {
    const dbFile = OSMask.databaseFile(isDev);
    db = await open({
        filename: dbFile,
        driver: sqlite3.Database
    });
    return db;
}

getDB = () => {
    return db;
}

end = () => {
    // Nothing to close for now!
}


module.exports.UnitOfWork = {
    begin,
    getDB,
    end
};


// Create base data structures
module.exports.runSchemaMigrations = async () => {
    Logger.trace('Running schema migrations')
    
    await begin(); 
    await db.run(createTaskTable, []);
    await db.run(createTaskSyncTable, []);
    await db.run(createAccountsTable, []);
    db.close();
}


// Schema migrations

const createTaskTable = 
    'CREATE TABLE IF NOT EXISTS tasks (' 
    + 'task_id TEXT UNIQUE PRIMARY KEY,' 
    + 'title TEXT,' 
    + 'state TEXT NOT NULL,' 
    + 'created_at TEXT NOT NULL,' 
    + 'updated_at TEXT NOT NULL' 
    + ')';

const createTaskSyncTable = 
    'CREATE TABLE IF NOT EXISTS tasks_synch (' 
    + 'task_synch_id TEXT UNIQUE PRIMARY KEY,' 
    + 'task_id TEXT UNIQUE NOT NULL,' 
    + 'synch_status TEXT NOT NULL,' 
    + 'created_at TEXT NOT NULL,' 
    + 'updated_at TEXT NOT NULL' 
    + ')';

const createAccountsTable = 
    'CREATE TABLE IF NOT EXISTS accounts (' 
    + 'id TEXT UNIQUE PRIMARY KEY,' 
    + 'email TEXT UNIQUE NOT NULL,'
    + 'logged_in BOOLEAN NOT NULL' 
    + ')';