const { Task, TASK_STATE, TasksRepository } = require('./data');

function handleCreateTask(event, newTask) {
    const task = new Task(newTask.id, newTask.title, TASK_STATE[newTask.state], newTask.createdAt, newTask.updatedAt);
    TasksRepository.createTask(task);
}

function handleUpdateTasks(event, taskId, data) {
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