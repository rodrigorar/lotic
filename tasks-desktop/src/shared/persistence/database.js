const { OSMask } = require('../os/os-mask');
const { isDev } = require('../utils/utils');
const { Logger } = require('../logging/logger');
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
    // TODO: The db.close() should called here, not on the methods
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
    migrations.forEach(async (migration) => await db.run(migration, []));
    db.close();
}


// Schema migrations

const migrations = [
    "CREATE TABLE IF NOT EXISTS tasks (" 
    + "task_id TEXT UNIQUE PRIMARY KEY," 
    + "title TEXT,"
    + "created_at DATETIME NOT NULL,"
    + "updated_at DATETIME NOT NULL,"
    + "owner_id TEXT"
    + ')'
    , 
    "CREATE TABLE IF NOT EXISTS tasks_synch (" 
    + "task_synch_id TEXT UNIQUE PRIMARY KEY," 
    + "task_id TEXT UNIQUE NOT NULL,"
    + "synch_status TEXT NOT NULL,"
    + "created_at DATETIME NOT NULL," 
    + "updated_at DATETIME  NOT NULL" 
    + ')'
    ,
    "CREATE TABLE IF NOT EXISTS accounts ("
    + "id TEXT UNIQUE PRIMARY KEY,"
    + "email TEXT UNIQUE NOT NULL"
    + ')'
    ,
    "CREATE TABLE IF NOT EXISTS auth_tokens ("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "token TEXT UNIQUE NOT NULL,"
    + "refresh_token TEXT UNIQUE NOT NULL,"
    + "account_id TEXT NOT NULL,"
    + "expires_at DATETIME NOT NULL"
    + ')'
];