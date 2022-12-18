const { OSMask } = require('./os-mask');
const { isDev } = require('./utils');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const { Logger } = require('../../handlers/logging');

/*db.run("CREATE TABLE lorem (info TEXT)");

const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
for (let i = 0; i < 10; i++) {
    stmt.run("Ipsum " + i);
}
stmt.finalize();

db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
    console.log(row.id + ": " + row.info);
});*/

let db;
begin = async () => {
    const dbFile = OSMask.databaseFile(isDev);
    Logger.trace('File: ' + dbFile);
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
    await begin(); 
    Logger.trace('Running schema migrations')
    await db.run(createTaskTable, []);
    await db.run(createTaskSyncTable, []);
    db.close();
}


// Schema migrations

const createTaskTable = 
    'CREATE TABLE IF NOT EXISTS tasks (' +
        'task_id TEXT UNIQUE PRIMARY KEY,' +
        'title TEXT,' +
        'state TEXT NOT NULL,' +  
        'created_at TEXT NOT NULL,' +
        'updated_at TEXT NOT NULL' +
    ')';

const createTaskSyncTable = 'CREATE TABLE IF NOT EXISTS tasks_sync (' +
        'task_sync_id TEXT UNIQUE PRIMARY KEY,' +
        'task_id TEXT UNIQUE NOT NULL,' +
        'synch_status TEXT NOT NULL,' +
        'created_at TEXT NOT NULL,' +
        'updated_at TEXT NOT NULL' +
    ')';
