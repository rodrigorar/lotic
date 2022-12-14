const { OSMask } = require('./os-mask');
const { isDev } = require('./utils');
const sqlite3 = require('sqlite3').verbose();

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
begin = () => {
    const dbFile = OSMask.databaseFile(isDev);
    db = new sqlite3.Database(dbFile);
}

end = () => {
    db.close();
}


module.exports.UnitOfWork = {
    begin,
    db,
    end
};


// Create base data structures
module.exports.runSchemaMigrations = () => {
    begin();
    db.run(createTaskTable);
    db.run(createTaskSyncTable);
    end();
}


// Schema migrations

const createTaskTable = 
    'CREATE TABLE IF NOT EXISTS task (' +
        'task_id TEXT UNIQUE PRIMARY KEY,' +
        'title TEXT,' +
        'state TEXT NOT NULL,' +  
        'created_at TEXT NOT NULL,' +
        'updated_at TEXT NOT NULL' +
    ')';

const createTaskSyncTable = 'CREATE TABLE IF NOT EXISTS task_sync (' +
        'task_sync_id TEXT UNIQUE PRIMARY KEY,' +
        'task_id TEXT UNIQUE NOT NULL,' +
        'synch_status TEXT NOT NULL,' +
        'created_at TEXT NOT NULL,' +
        'updated_at TEXT NOT NULL' +
    ')';
