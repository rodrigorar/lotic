const { Validators } = require("../shared/utils");
const { TasksRepository, Task, TASK_STATE } = require("./data");

function create(taskData) {
    Validators.isNotNull(taskData, 'No task data was provided!');

    const task = new Task(taskData.id, taskData.title, TASK_STATE[taskData.state], taskData.createdAt, taskData.updatedAt);
    TasksRepository.createTask(task);
}

function update(taskId, taskData) {
    Validators.isNotNull(taskId, 'No task id was provided!');
    Validators.isNotNull(taskData, 'No task data was provided!');

    TasksRepository.updateTask(taskId, taskData);
}

async function list() {
    return await TasksRepository.listTasks();
}

async function listById(taskIdList = []) {
    TasksRepository.listById(taskIdList);
}

function erase(taskId) {
    Validators.isNotNull(taskId, 'No task id was provided!');

    TasksRepository.deleteTask(taskId);
}

module.exports.TaskServices = {
    create,
    update,
    list,
    listById,
    erase
}