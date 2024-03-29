const { OSMask } = require('../os/os-mask');
const { isDev } = require('../../domain/shared/utils');
const { Logger } = require('../../domain/shared/logger');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const { v4 } = require("uuid");
const { Tables, Fields } = require('./tables');
const { SupportedLanguages, Translations } = require('../../resources/internationalization.config');

// DEPRECATED //////////////////////////////////////////////////////////

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

// DEPRECATED //////////////////////////////////////////////////////////

// Base App Data

const persistNewLanguage = async (name, code) => {
    const result = await db.get(
        `SELECT * FROM ${Tables.I18NLanguages} WHERE ${Fields.I18NLanguages.Name} = ?`
        , [name]
    );
    if (! result) {
        await db.run(
            `INSERT INTO ${Tables.I18NLanguages} (${Fields.I18NLanguages.Name}, ${Fields.I18NLanguages.Code}) `
            + `VALUES (?, ?)`
            , [name, code]
        );
    }
}

const addTranslation = async (key, language, value) => {
    const result = await db.get(
        `SELECT * FROM ${Tables.I18N} WHERE ${Fields.I18N.Key} = ? AND ${Fields.I18N.Language} = ?`
        , [key, language]
    );
    
    if (! result) {
        await db.run(
            `INSERT INTO ${Tables.I18N} (${Fields.I18N.Key}, ${Fields.I18N.Language}, ${Fields.I18N.Value}) `
            + `VALUES (?, ?, ?)`
            , [key, language, value]
        );
    }
}

// FIXME: Add a flag to AppConfig that will run the data migrations or not
// the way this is right now it might make the application slow to launch.
// also, after running the default data migration the flag in the configs should
// be reset to false (prevents from running more than once)
const runDefaultData = async () => {
    for (const language of SupportedLanguages) {
        persistNewLanguage(language.name, language.code);
        const translation = Translations[language.code];
        for (const entry of Object.keys(translation)) {
            addTranslation(entry, language.code, translation[entry]);
        }
    }
}

// Create base data structures

async function run_schema_migration(schemaMigration) {    
    Logger.trace(`Schema Migration Version: ${schemaMigration.version}`);
    Logger.trace(`Shcmea Migration Description: ${schemaMigration.description}`);

    await db.run(
        schemaMigration.migration
        , []);
    await db.run(
        "INSERT INTO schema_migrations (id, version, description, created_at) VALUES (?, ?, ? ,?)"
        , [v4(), schemaMigration.version, schemaMigration.description, new Date().toISOString()]);
}

module.exports.runSchemaMigrations = async () => {
    Logger.trace('Running schema migrations')
    
    await begin();

    const schema_migration_table_exists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'");
    if (! schema_migration_table_exists) {
        await run_schema_migration(migrations[0])
    }

    const currentVersion = await db.get("SELECT max(version) as version_max FROM schema_migrations");
    for (let index = currentVersion.version_max + 1; index < migrations.length; index++) {
        await run_schema_migration(migrations[index]);
    }

    await runDefaultData();

    db.close();
}


// Schema migrations

const migrations = [
    {
        version: 0
        , description: "Create schema migrations table"
        , migration: "CREATE TABLE IF NOT EXISTS schema_migrations("
            + "id TEXT PRIMARY KEY,"
            + "version INTEGER UNIQUE,"
            + "description TEXT NOT NULL,"
            + "created_at DATETIME NOT NULL"
            + ')'
    },
    {
        version: 1
        , description: "Create tasks table"
        , migration: "CREATE TABLE IF NOT EXISTS tasks (" 
            + "task_id TEXT UNIQUE PRIMARY KEY," 
            + "title TEXT,"
            + "created_at DATETIME NOT NULL,"
            + "updated_at DATETIME NOT NULL,"
            + "owner_id TEXT"
            + ')'
    }, 
    {
        version: 2
        , description: "Create tasks_synch table"
        , migration: "CREATE TABLE IF NOT EXISTS tasks_synch (" 
            + "task_synch_id TEXT UNIQUE PRIMARY KEY," 
            + "task_id TEXT UNIQUE NOT NULL,"
            + "synch_status TEXT NOT NULL,"
            + "created_at DATETIME NOT NULL," 
            + "updated_at DATETIME  NOT NULL" 
            + ')'
    },
    {
        version: 3
        , description: `Create ${Tables.ACCOUNTS} table`
        , migration: "CREATE TABLE IF NOT EXISTS accounts ("
            + "id TEXT UNIQUE PRIMARY KEY,"
            + "email TEXT UNIQUE NOT NULL"
            + ')'
    },
    {
        version: 4
        , description: "Create auth_tokens table"
        , migration: "CREATE TABLE IF NOT EXISTS auth_tokens ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "token TEXT UNIQUE NOT NULL,"
            + "refresh_token TEXT UNIQUE NOT NULL,"
            + "account_id TEXT NOT NULL,"
            + "expires_at DATETIME NOT NULL"
            + ')'
    },
    {
        version: 5
        , description: "Rename tasks_synch table to tasks_sync"
        , migration: "ALTER TABLE tasks_synch RENAME TO tasks_sync"
    },
    {
        version: 6
        , description: "Rename auth_tokens table to auth_sessions"
        , migration: "ALTER TABLE auth_tokens RENAME TO auth_sessions"
    },
    {
        version: 7
        , description: "Add position field tasks table"
        , migration: "ALTER TABLE tasks ADD position INTEGER NOT NULL DEFAULT 0"
    },
    {
        version: 8
        , description: "Add language field to account"
        , migration: "ALTER TABLE accounts ADD language TEXT DEFAULT en"
    },
    {
        version: 9
        , description: "Add a i18n table"
        , migration: "CREATE TABLE IF NOT EXISTS i18n ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            + "key TEXT NOT NULL, "
            + "language TEXT NOT NULL, "
            + "value TEXT NOT NULL"
            + ")"
    },
    {
        version: 10
        , description: "Add a i18n_languages table"
        , migration: "CREATE TABLE IF NOT EXISTS i18n_languages ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            + "name TEXT UNIQUE NOT NULL, "
            + "code TEXT UNIQUE NOT NULL"
            + ")"
    }
];