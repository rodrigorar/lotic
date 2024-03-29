const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { 
    UseCaseCreateTaskProvider
    , UseCaseUpdateTaskProvider
    , UseCaseUpdateTasksProvider
    , UseCaseDeleteTaskProvider
    , UseCaseGetTaskByIdProvider
    , UseCaseListTasksForAccountProvider
    , UseCaseListTasksWithoutOwnerProvider
} = require("./providers");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { EventBus, Event, EventType } = require("../../../domain/shared/event-bus");
const { SynchManager } = require('../sync/synch-manager');
const { TASK_SYNC_STATUS } = require("../../../domain/modules/tasks");

async function handleCreateTask(event, newTask) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseCreateTask = UseCaseCreateTaskProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        await useCaseCreateTask.execute(unitOfWork, newTask)
    });
}

async function handleUpdateTasks(event, taskId, data) {
    const useCaseUpdateTaskProvider = UseCaseUpdateTaskProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseUpdateTaskProvider.execute(unitOfWork, data);
    });
}

async function handleCompletion(event, taskId) {
    const useCaseEraseTask = UseCaseDeleteTaskProvider.get();
    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseEraseTask.execute(unitOfWork, taskId);
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
    const useCaseListTasks = UseCaseListTasksForAccountProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const targetTask = await useCaseGetTaskById.execute(unitOfWork, targetTaskId);
        const draggedTask = await useCaseGetTaskById.execute(unitOfWork, draggedTaskId);
        
        const auxPosition = targetTask.position;
        targetTask.position = draggedTask.position;
        draggedTask.position = draggedTask.position == auxPosition ? auxPosition + 1 : auxPosition;

        targetTask.syncStatus = TASK_SYNC_STATUS.DIRTY;
        draggedTask.syncStatus = TASK_SYNC_STATUS.DIRTY;

        await useCaseUpdateTask.execute(unitOfWork, targetTask);
        await useCaseUpdateTask.execute(unitOfWork, draggedTask);
    });
    
    // Recalculates all the other positions to remove duplicates
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
        if (activeSession != undefined) {
            let taskList = await useCaseListTasks.execute(unitOfWork, activeSession.accountId);
            let currentPosition = 0;
            taskList = taskList
                .map((task) => {
                    if (currentPosition != task.position) {
                        task.position = currentPosition;
                        task.syncStatus = TASK_SYNC_STATUS.DIRTY;
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