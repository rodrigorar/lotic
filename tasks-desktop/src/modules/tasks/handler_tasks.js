const { SynchManager } = require('../synch-manager');
const { TaskServices } = require('./services');
const { TasksSynchServices } = require('../tasks_synch/services');
const { AuthServices } = require('../auth/services');

async function handleCreateTask(event, newTask) {
    const activeSession = await AuthServices.getActiveSession();
    if (activeSession != undefined) {
        newTask.ownerId = activeSession.accountId;
    }

    TaskServices
        .create(newTask)
        .then(() => {
            TasksSynchServices.createSynchMonitor(newTask.id);
        });
    
    SynchManager.execute();
}

let updateTaskCounter = 0;

function handleUpdateTasks(event, taskId, data) {
    TaskServices.update(taskId, data);
    TasksSynchServices.markDirty(taskId);

    // TODO: Find a better way to optimize the synch with the server
    if (updateTaskCounter >= 40) {
        SynchManager.execute();
        updateTaskCounter = 0;
    } else {
        updateTaskCounter += 1;
    }
}

function handleCompletion(event, taskId) {
    TaskServices.deleteTask(taskId);
    TasksSynchServices.markForRemoval(taskId);
    SynchManager.execute();
}

async function handleListTasks(event) {
    const activeSession = await AuthServices.getActiveSession();
    if (activeSession != undefined) {
        return await TaskServices.list(activeSession.accountId);
    } else {
        return await TaskServices.listTasksWithoutOwner();
    }
}

async function handleLogout(event, accountId) {
    // Order mathers, we need tasks to delete tasks synch
    await TasksSynchServices.deleteAllForAccount(accountId);
    await TaskServices.deleteAllForAccount(accountId);
}

module.exports.TasksHandler = {
    handleCreateTask
    , handleUpdateTasks
    , handleCompletion
    , handleListTasks
    , handleLogout
}