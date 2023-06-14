const { SynchManager } = require('../synch-manager');
const { TaskServices } = require('./services');
const { TasksSyncServices } = require('../tasks_synch/services');
const { AuthServices } = require('../auth/services');
const { RunUnitOfWork } = require('../../shared/persistence/unitofwork');
const { TASK_SYNCH_STATUS } = require('../tasks_synch/data');

async function handleCreateTask(event, newTask) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await AuthServices.getActiveSession(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        TaskServices
            .create(unitOfWork, newTask)
            .then(() => {
                TasksSyncServices.createSyncMonitor(
                    unitOfWork
                    , newTask.id
                    , TASK_SYNCH_STATUS["LOCAL"]);
            });
    });
    SynchManager.execute();
}

let updateTaskCounter = 0;

// TODO: We need a buffer for this input, in order to not lag on the UI
async function handleUpdateTasks(event, taskId, data) {

    console.log("Updating task information with:");
    console.log(data);

    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServices.update(unitOfWork, data);
        TasksSyncServices.markDirty(unitOfWork, taskId);
    });

    // TODO: Find a better way to optimize the synch with the server
    if (updateTaskCounter >= 40) {
        SynchManager.execute();
        updateTaskCounter = 0;
    } else {
        updateTaskCounter += 1;
    }
}

async function handleCompletion(event, taskId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServices.deleteTask(unitOfWork, taskId);
        TasksSyncServices.markForRemoval(unitOfWork, taskId);
    }) ;
    
    SynchManager.execute();
}

async function handleListTasks(event) {
    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await AuthServices.getActiveSession(unitOfWork);

        if (activeSession != undefined) {
            return await TaskServices.list(unitOfWork, activeSession.accountId);
        } else {
            return await TaskServices.listTasksWithoutOwner(unitOfWork);
        }
    });
}

async function handleLogout(event, accountId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TasksSyncServices.deleteAllForAccount(unitOfWork, accountId);
        await TaskServices.deleteAllForAccount(unitOfWork, accountId);
    });
}

module.exports.TasksHandler = {
    handleCreateTask
    , handleUpdateTasks
    , handleCompletion
    , handleListTasks
    , handleLogout
}