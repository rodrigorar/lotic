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
const { EventBus, EventType, EventSubscriber } = require('./domain/shared/event-bus');
const { RunUnitOfWork } = require('./infrastructure/persistence/unitofwork');
const { v4 } = require('uuid');
const { 
  UseCaseListTasksWithoutOwnerProvider
  , UseCaseUpdateTaskOwnerProvider
  , UseCaseListTasksForAccountProvider
  , UseCaseDeleteAllTasksForAccountProvider
} = require('./infrastructure/modules/tasks/providers');
const {
  UseCaseSignOutProvider
  , UseCaseGetActiveSessionProvider
} = require('./infrastructure/modules/auth/providers');
const { AccountsHandler } = require('./infrastructure/modules/accounts/handlers');

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
      nodeIntegration: true
      , preload: path.join(__dirname, 'preload.js'),
    }
    , resizable: false
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
  cron.schedule('*/30 * * * * *', () => {
    if (schemaMigrationSemaphor) {
      SynchManager.execute();
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

  globalShortcut.register("F6", () => {
    SynchManager.execute(mainWindow.webContents);
  });

  LoggerHandler.configure(ipcMain);
  UtilsHandler.configure(ipcMain);
  TasksHandler.configure(ipcMain);
  AccountsHandler.configure(ipcMain, mainWindow);
  AuthHandler.configure(ipcMain);
});

ipcMain.on('nav:open:login', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/signin/signin.html')));
ipcMain.on('nav:open:about', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/about/about.html')));
ipcMain.on('nav:open:home', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html')));
ipcMain.on('nav:open:signup', async (event) => mainWindow.loadFile(path.join(__dirname, 'ui/signup/signup.html')))

// UI Event Listeners

EventBus.register(
  EventType.REPOSITION_TASKS_SUCCESS
  , new EventSubscriber(v4(), (event) => mainWindow.webContents.send("ui:refresh")))


// EventBus Listeners

EventBus.register(
  EventType.REFRESH_FAILED
  , new EventSubscriber(v4(), async (event) => {
      const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
      const useCaseDeleteAllTasksForAccount = UseCaseDeleteAllTasksForAccountProvider.get();
      const useCaseSignOut = UseCaseSignOutProvider.get();

      await RunUnitOfWork.run(async (unitOfWork) => {
          const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
          await useCaseDeleteAllTasksForAccount.execute(unitOfWork, activeSession.accountId);
          await useCaseSignOut.execute(unitOfWork, activeSession);
      });

      mainWindow.webContents.send("auth:logged_out");
  }));

EventBus.registerForSeveralEventTypes(
  [EventType.CREATED_LOCAL_TASKS, EventType.DELETED_LOCAL_TASKS]
  , new EventSubscriber(v4(), (event) => {
      setTimeout(async () => {
          const useCaseListTasksForAccount = UseCaseListTasksForAccountProvider.get();
          const refreshedTasks = await RunUnitOfWork.run(async (unitOfWork) => {
            return await useCaseListTasksForAccount.execute(unitOfWork, event.body.accountId);
          });
          mainWindow.webContents.send('tasks:refresh', refreshedTasks); 
        }
      , 500);
  })
);

EventBus.register(
  EventType.SYNC_STARTED
  , new EventSubscriber(v4(), (event) => {
    mainWindow.webContents.send("ui:loading:start");
  })
);

EventBus.register(
  EventType.SYNC_ENDED
  , new EventSubscriber(v4(), (event) => {
    mainWindow.webContents.send("ui:loading:end")
  })
);

EventBus.register(
  EventType.SIGN_UP_FAILURE
  , new EventSubscriber(v4(), async (event) => {
      webContents.getFocusedWebContents().send('accounts:signup_failure', event.body);
  }));

EventBus.register(
  EventType.LOGIN_SUCCESS
  , new EventSubscriber(v4(), async (event) => {
      const useCaseListTasksWithoutOwner = UseCaseListTasksWithoutOwnerProvider.get();
      const useCaseUpdateTaskOwner = UseCaseUpdateTaskOwnerProvider.get();
      RunUnitOfWork.run(async (unitOfWork) => {
          const tasksWithoutOwner = await useCaseListTasksWithoutOwner.execute(unitOfWork);
          tasksWithoutOwner.forEach(async (task) => { 
              task.ownerId = event.body.account_id;
              await useCaseUpdateTaskOwner.execute(unitOfWork, task)
          });
      });

      mainWindow.loadFile(path.join(__dirname, 'ui/home/home.html'));

      await SynchManager.execute();

      webContents.getFocusedWebContents().send('auth:logged_in');
  }));

EventBus.register(
  EventType.LOGIN_FAILURE
  , new EventSubscriber(v4(), async (event) => {
      webContents.getFocusedWebContents().send('auth:login_failed', event.body);
  }));
