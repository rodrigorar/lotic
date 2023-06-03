const cron = require('node-cron');
const { runSchemaMigrations } = require('./shared/persistence/database');
const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { LoggerHandler } = require('./shared/logging/handler_logging');
const { UtilsHandler } = require('./shared/utils/handler_utils');
const { TasksHandler } = require('./modules/tasks/handler_tasks');
const { OSMask } = require('./shared/os/os-mask');
const { isDev } = require('./shared/utils/utils');
const { SynchManager } = require('./modules/synch-manager');
const { Logger } = require('./shared/logging/logger');
const { AuthHandlers } = require('./modules/auth/handler_auth');
const { AuthServices } = require('./modules/auth/services');
const { TasksSynchServices } = require('./modules/tasks_synch/services');
const { EventType } = require('./shared/event-bus');
const { EventBus } = require('./shared/event-bus');
const { EventSubscriber } = require('./shared/event-bus');
const { v4 } = require("uuid");
const { RunUnitOfWork } = require('./shared/persistence/unitofwork');

app.setName('Tasks');

// Prepare local data directories
OSMask.prepareDataDirIfNecessary(isDev);

let schemaMigrationSemaphor = false;

runSchemaMigrations()
  .then(_ => schemaMigrationSemaphor = true);

let closeSemaphor = true;
let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
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

app.on('ready', () => {
  createWindow()

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
      closeSemaphor = false;
      e.preventDefault();

      SynchManager.execute()
        .then(() => {
          closeSemaphor = false;
          setTimeout(() => {
            if (process.platform !== "darwin") {
              app.quit()
            }
          }, 5000);
        });
    }
  });

  globalShortcut.register("F5", () => {
    SynchManager.execute(mainWindow.webContents);
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
ipcMain.on('auth:logout', async (event) => {
  const activeSession = await RunUnitOfWork.run(async (unitOfWork) => {
    return await AuthServices.getActiveSession(unitOfWork);
  }); 
  await TasksHandler.handleLogout(event, activeSession.accountId);
  await AuthHandlers.handleLogout(event); // This one has to be last, we need to know which account is logging out
});
ipcMain.handle('auth:is_logged_in', AuthHandlers.handleIsLoggedIn);


// EventBus Listeners

EventBus.register(
  EventType.REFRESH_FAILED
  , new EventSubscriber(v4(), (event) => mainWindow.webContents.send("auth:logged_out")));