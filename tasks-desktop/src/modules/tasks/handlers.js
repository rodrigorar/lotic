const { Logger } = require('../../handlers/logging');
const { Task, TASK_STATE, TasksRepository } = require('./data');

function handleCreateTask(event, newTask) {
    const task = new Task(newTask.id, newTask.title, TASK_STATE[newTask.state], newTask.createdAt, newTask.updatedAt);
    TasksRepository.createTask(task);
}

function handleUpdateTasks(event, taskId, data) {
    // TODO: Not implemented
    console.log('Event: Update Tasks was called!');
    console.log('Task Id: ' + taskId);
    console.log('Title: ' + data.title);
    console.log('Updated At: ' + data.updatedAt);

    TasksRepository.updateTask(taskId, data);
}

function handleCompletion(event, taskId) {
    TasksRepository.deleteTask(taskId);
}

async function handleListTasks(event) {
    return await TasksRepository.listTasks();
}

module.exports.TasksHandler = {
    handleCreateTask,
    handleUpdateTasks,
    handleCompletion,
    handleListTasks
}