const { TaskServices } = require('./services');

function handleCreateTask(event, newTask) {
    TaskServices.create(newTask);
}

function handleUpdateTasks(event, taskId, data) {
    TaskServices.update(taskId, data);
}

function handleCompletion(event, taskId) {
    TaskServices.erase(taskId);
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