const { runSchemaMigrations } = require('./modules/shared/database');
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { OSMask } = require('./modules/shared/os-mask');
const { isDev } = require('./modules/shared/utils');

// Prepare local data directories
OSMask.prepareDataDirIfNecessary(isDev);

runSchemaMigrations();

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