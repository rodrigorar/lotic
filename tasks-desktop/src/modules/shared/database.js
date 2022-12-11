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
    db.run('CREATE TABLE IF NOT EXISTS task (id TEXT UNIQUE, content TEXT, created_at TEXT, updated_at TEXT);');
    end();
}

