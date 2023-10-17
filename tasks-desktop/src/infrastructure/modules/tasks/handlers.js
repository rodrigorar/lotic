const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { 
    UseCaseCreateTaskProvider
    , UseCaseUpdateTaskProvider
    , UseCaseUpdateTasksProvider
    , UseCaseDeleteTaskProvider
    , UseCaseDeleteAllTasksForAccountProvider
    , UseCaseGetTaskByIdProvider
    , UseCaseListTasksForAccountProvider
    , UseCaseListTasksWithoutOwnerProvider
    , UseCaseCreateTaskSyncProvider
    , UseCaseMarkTaskSyncForRemovalProvider
    , UseCaseDeleteAllTaskSyncsForAccountProvider
    , UseCaseMarkTaskSyncDirtyProvider
} = require("./providers");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { EventBus, Event, EventType } = require("../../../domain/shared/event-bus");
const { SynchManager } = require('../sync/synch-manager');

async function handleCreateTask(event, newTask) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseCreateTask = UseCaseCreateTaskProvider.get();
    const useCaseCreateTasksSync = UseCaseCreateTaskSyncProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        useCaseCreateTask
            .execute(unitOfWork, newTask)
            .then(() => useCaseCreateTasksSync.execute(unitOfWork, newTask.id));
    });
}

async function handleUpdateTasks(event, taskId, data) {
    const useCaseUpdateTaskProvider = UseCaseUpdateTaskProvider.get();
    const useCaseMarkTaskSyncDirty = UseCaseMarkTaskSyncDirtyProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseUpdateTaskProvider.execute(unitOfWork, data);
        await useCaseMarkTaskSyncDirty.execute(unitOfWork, taskId);
    });
}

async function handleCompletion(event, taskId) {
    const useCaseEraseTask = UseCaseDeleteTaskProvider.get();
    const useCaseMarkTaskSyncsForRemoval = UseCaseMarkTaskSyncForRemovalProvider.get();
    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseEraseTask.execute(unitOfWork, taskId);
        await useCaseMarkTaskSyncsForRemoval.execute(unitOfWork, taskId);
    });
}

async function handleListTasks(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseListTasksForAccount = UseCaseListTasksForAccountProvider.get();
    const useCaseListTasksWithoutOwner = UseCaseListTasksWithoutOwnerProvider.get();

    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);

        if (activeSession != undefined) {
            return await useCaseListTasksForAccount.execute(unitOfWork, activeSession.accountId);
        } else {
            return await useCaseListTasksWithoutOwner.execute(unitOfWork);
        }
    });
}

async function handleTaskRepositioning(event, targetTaskId, draggedTaskId) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseUpdateTask = UseCaseUpdateTaskProvider.get();
    const useCaseUpdateTasks = UseCaseUpdateTasksProvider.get();
    const useCaseGetTaskById = UseCaseGetTaskByIdProvider.get();
    const useCaseMarkTaskSyncDirty = UseCaseMarkTaskSyncDirtyProvider.get();
    const useCaseListTasks = UseCaseListTasksForAccountProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const targetTask = await useCaseGetTaskById.execute(unitOfWork, targetTaskId);
        const draggedTask = await useCaseGetTaskById.execute(unitOfWork, draggedTaskId);
        
        const auxPosition = targetTask.position;
        targetTask.position = draggedTask.position;
        draggedTask.position = auxPosition;

        await useCaseUpdateTask.execute(unitOfWork, targetTask);
        await useCaseMarkTaskSyncDirty.execute(unitOfWork, targetTaskId);
        await useCaseUpdateTask.execute(unitOfWork, draggedTask);
        await useCaseMarkTaskSyncDirty.execute(unitOfWork, draggedTaskId);
    });
    
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
        if (activeSession != undefined) {
            let taskList = await useCaseListTasks.execute(unitOfWork, activeSession.accountId);
            let currentPosition = 0;
            taskList = taskList
                .map((task) => {
                    if (currentPosition != task.position) {
                        task.position = currentPosition;
                    }
                    currentPosition++;
                    return task;
                })
            useCaseUpdateTasks.execute(unitOfWork, taskList);
        }
    });

    EventBus.publish(new Event(EventType.REPOSITION_TASKS_SUCCESS, {}));
}

function configure(ipcMain) {
    ipcMain.on('tasks:create', handleCreateTask);
    ipcMain.on('tasks:update', handleUpdateTasks);
    ipcMain.on('tasks:complete', handleCompletion);
    ipcMain.handle('tasks:list', handleListTasks);
    ipcMain.on('tasks:reposition', handleTaskRepositioning);
    ipcMain.on('tasks:refresh', (event) => {
        SynchManager.execute();
    });
}

module.exports.TasksHandler = {
    configure
}