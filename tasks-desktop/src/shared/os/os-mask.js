const { hideSync } = require('hidefile');
const fs = require('fs');
const Path = require('path');
const { Logger } = require('../../domain/shared/logger');

const homedir = require('os').homedir();
const DATA_FILE = 'tasks_db.sqlite';

const prepareDataDirIfNecessary = (isDev) => {
    if (isDev) {
        return;
    }

    const baseDir = Path.join(homedir, 'tasks');
    if (! fs.existsSync(Path.join(homedir, '.tasks'))) {
        if (! fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }
        hideSync(baseDir);
    }
} 

const databaseFile = (isDev) => {
    return isDev ? './tasks_dev.sqlite' : Path.join(homedir, '.tasks', DATA_FILE);
}

module.exports.OSMask = {
    databaseFile,
    prepareDataDirIfNecessary
}