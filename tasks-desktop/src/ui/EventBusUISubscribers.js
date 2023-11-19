const path = require('path');
const { v4 } = require('uuid');
const { webContents } = require('electron');
const { EventBus, EventType, EventSubscriber } = require('./../domain/shared/event-bus');
const { RunUnitOfWork } = require('./../infrastructure/persistence/unitofwork');
const { 
    UseCaseListTasksWithoutOwnerProvider
    , UseCaseUpdateTaskOwnerProvider
    , UseCaseListTasksForAccountProvider
    , UseCaseDeleteAllTasksForAccountProvider
  } = require('./../infrastructure/modules/tasks/providers');
  const {
    UseCaseSignOutProvider
    , UseCaseGetActiveSessionProvider
  } = require('./../infrastructure/modules/auth/providers');
  const { SynchManager } = require('./../infrastructure/modules/sync/synch-manager');

const setupUIEventBusSubscribers = (mainWindow) => {
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
    
            mainWindow.loadFile(path.join(__dirname, './home/home.html'));
    
            await SynchManager.execute();
    
            webContents.getFocusedWebContents().send('auth:logged_in');
        }));
    
    EventBus.register(
        EventType.LOGIN_FAILURE
        , new EventSubscriber(v4(), async (event) => {
            webContents.getFocusedWebContents().send('auth:login_failed', event.body);
        }));
}

module.exports.SetupUIEventBusSubscribers = setupUIEventBusSubscribers;