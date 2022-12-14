const { runSchemaMigrations } = require('./modules/shared/database');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { LoggerHandler } = require('./handlers/logging');
const { OSMask } = require('./modules/shared/os-mask');
const { isDev } = require('./modules/shared/utils');
const { HttpClient } = require('./modules/shared/http');

// Prepare local data directories
OSMask.prepareDataDirIfNecessary(isDev);

runSchemaMigrations();

HttpClient.get('/persons/1')
  .then(result => {
    if (result) {
      console.log('Backend Call!');
      console.log(result.data);
    }
  });

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html'));
};

app.on('ready', () => {
  createWindow()

  Menu.setApplicationMenu(null);
});

// Logging Event Listeners

ipcMain.on('log:trace', LoggerHandler.handleTraceLog);
ipcMain.on('log:info', LoggerHandler.handleInfoLog);
ipcMain.on('log:warn', LoggerHandler.handleWarnLog);
ipcMain.on('log:error', LoggerHandler.handleErrorLog);