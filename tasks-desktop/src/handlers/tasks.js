const { SynchManager } = require('../modules/synch-manager');
const { TaskServices } = require('../modules/tasks/services');
const { TasksSynchServices } = require('../modules/tasks_synch/services');

function handleCreateTask(event, newTask) {
    TaskServices.create(newTask);
    TasksSynchServices.createSynchMonitor(newTask.id);
    SynchManager.execute();
}

function handleUpdateTasks(event, taskId, data) {
    TaskServices.update(taskId, data);
    TasksSynchServices.markDirty(taskId);

    // TODO: Synch tasks with backend but it cannot fire for every letter entered by the user
}

function handleCompletion(event, taskId) {
    TaskServices.erase(taskId);
    TasksSynchServices.markDirty(taskId);
    SynchManager.execute();
}

async function handleListTasks(event) {
    SynchManager.execute();
    return await TaskServices.list();
}

module.exports.TasksHandler = {
    handleCreateTask,
    handleUpdateTasks,
    handleCompletion,
    handleListTasks
}