const cron = require('node-cron');
const { runSchemaMigrations } = require('./infrastructure/persistence/database');
const { app, BrowserWindow, Menu, ipcMain, globalShortcut, webContents } = require('electron');
const path = require('path');
const { LoggerHandler } = require('./infrastructure/logging/handlers');
const { UtilsHandler } = require('./infrastructure/utils/handlers');
const { TasksHandler } = require('./infrastructure/modules/tasks/handlers');
const { AuthHandler } = require('./infrastructure/modules/auth/handlers');
const { OSMask, isDev } = require('./infrastructure/os/os-mask');
const { SynchManager } = require('./infrastructure/modules/sync/synch-manager');
const { AccountsHandler } = require('./infrastructure/modules/accounts/handlers');
const { SetupUIEventBusSubscribers } = require('./ui/EventBusUISubscribers');
const { AppConfig } = require('./infrastructure/configs');
const { InternationalizationHandler } = require('./infrastructure/modules/internationalization/handlers');

app.setName(AppConfig.appName);

// Prepare local data directories
OSMask.prepareDataDirIfNecessary(isDev);

let schemaMigrationSemaphor = false;
let allowSyncSemaphor = true;

runSchemaMigrations()
  .then(_ => schemaMigrationSemaphor = true);

let closeSemaphor = true;
let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    minWidth: 400,
    minHeight: 500,
    maxWidth: 1200,
    maxHeight: 1500,
    webPreferences: {
      nodeIntegration: true
      , preload: path.join(__dirname, 'preload.js'),
    }
    //, resizable: false
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html'));

  return mainWindow;
};

app.on('ready', () => {
  createWindow()

  Menu.setApplicationMenu(null);

  if (schemaMigrationSemaphor) {
    SynchManager.execute();
  }

  // FIXME: This cron should come from a config file.
  cron.schedule(AppConfig.syncManagerCron, () => {
    if (schemaMigrationSemaphor && allowSyncSemaphor) {
      SynchManager.execute();
    }
  }).start();

  mainWindow.on('focus', () => {
    setTimeout(() => {
      allowSyncSemaphor = true;
      SynchManager.execute();
    }, 500);
  });

  mainWindow.on('blur', () => {
    allowSyncSemaphor = false;
  })

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

      globalShortcut.unregister('F6');
    }
  });

  globalShortcut.register('F6', () => {
    setTimeout(() => SynchManager.execute(mainWindow.webContents), 100);
  });

  AppConfig.defaultLanguage = app.getLocale().substring(0, 2);

  LoggerHandler.configure(ipcMain);
  UtilsHandler.configure(ipcMain);
  TasksHandler.configure(ipcMain);
  AccountsHandler.configure(ipcMain, mainWindow);
  AuthHandler.configure(ipcMain);
  InternationalizationHandler.configure(ipcMain);

  SetupUIEventBusSubscribers(mainWindow);

  ipcMain.on('ui:reload', () => mainWindow.webContents.reloadIgnoringCache());
});

// Page Navigation

ipcMain.on('nav:open:login', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/signin/signin.html')));
ipcMain.on('nav:open:about', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/about/about.html')));
ipcMain.on('nav:open:settings', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/settings/settings.html')));
ipcMain.on('nav:open:home', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html')));
ipcMain.on('nav:open:signup', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/signup/signup.html')))

// Prevents syncs while the user is writting.
ipcMain.on('sync:allow', (event) => {
  allowSyncSemaphor = true;
});
ipcMain.on('sync:disallow', (event) => {
  allowSyncSemaphor = false;
});