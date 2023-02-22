const cron = require('node-cron');
const { runSchemaMigrations } = require('./shared/persistence/database');
const { app, BrowserWindow, Menu, ipcMain, webContents } = require('electron');
const path = require('path');
const { LoggerHandler } = require('./shared/logging/handler_logging');
const { UtilsHandler } = require('./shared/utils/handler_utils');
const { TasksHandler } = require('./modules/tasks/handler_tasks');
const { OSMask } = require('./shared/os/os-mask');
const { isDev } = require('./shared/utils/utils');
const { SynchManager } = require('./modules/synch-manager');
const { Logger } = require('./shared/logging/logger');
const { AuthHandlers } = require('./modules/auth/handler_auth');

// Prepare local data directories
OSMask.prepareDataDirIfNecessary(isDev);

let schemaMigrationSemaphor = false;

runSchemaMigrations()
  .then(_ => schemaMigrationSemaphor = true);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html'));

  return mainWindow;
};

let closeSemaphor = true;

app.on('ready', () => {
  const mainWindow = createWindow()

  Menu.setApplicationMenu(null);

  if (schemaMigrationSemaphor) {
    // Run Synch Manager at the start
    SynchManager.execute(mainWindow.webContents);
  }

  // TODO: This cron should come from a config file.
  cron.schedule('*/30 * * * * *', () => {
    if (schemaMigrationSemaphor) {
      SynchManager.execute(mainWindow.webContents);
    }
  }).start();

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('before-quit', (e) => {

    if (closeSemaphor) {
      e.preventDefault();

      SynchManager.execute()
        .then(() => {
          closeSemaphor = false;
          app.quit();
        });
    }
  });
});

// Logging Event Listeners

ipcMain.on('log:trace', LoggerHandler.handleTraceLog);
ipcMain.on('log:info', LoggerHandler.handleInfoLog);
ipcMain.on('log:warn', LoggerHandler.handleWarnLog);
ipcMain.on('log:error', LoggerHandler.handleErrorLog);

// Utils Event Listeners
ipcMain.handle('utils:id:generate', UtilsHandler.handleGenerateId);

// Tasks Event Listeners
ipcMain.on('tasks:create', TasksHandler.handleCreateTask);
ipcMain.on('tasks:update', TasksHandler.handleUpdateTasks);
ipcMain.on('tasks:complete', TasksHandler.handleCompletion);
ipcMain.handle('tasks:list', TasksHandler.handleListTasks);

// Auth Event Listeners
ipcMain.on('auth:open:login', AuthHandlers.handleOpenLogin);
ipcMain.on('auth:login', AuthHandlers.handleLogin);