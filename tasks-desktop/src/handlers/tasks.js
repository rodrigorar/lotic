const { SynchManager } = require('../modules/synch-manager');
const { TaskServices } = require('../modules/tasks/services');
const { TasksSynchServices } = require('../modules/tasks_synch/services');

function handleCreateTask(event, newTask) {
    TaskServices.create(newTask);
    TasksSynchServices.createSynchMonitor(newTask.id);
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
    return await TaskServices.list();
}

module.exports.TasksHandler = {
    handleCreateTask,
    handleUpdateTasks,
    handleCompletion,
    handleListTasks
}