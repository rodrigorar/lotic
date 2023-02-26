const { Validators } = require("../../shared/utils/utils");
const { TasksRepository, Task } = require("./data");

function create(taskData) {
    Validators.isNotNull(taskData, 'No task data was provided!');
    
    const task = 
        new Task(
            taskData.id
            , taskData.title
            , taskData.createdAt
            , taskData.updatedAt);
    TasksRepository.createTask(task);
}

async function createMultiple(tasksData) {
    Validators.isNotNull(tasksData, 'No tasks where provided');

    // TODO: Optimize this so it doesn't call the database so many times
    tasksData
        .map(taskData => 
                new Task(
                    taskData.id
                    , taskData.title
                    , taskData.createdAt
                    , taskData.updatedAt))
        .forEach(async task => await TasksRepository.createTask(task));
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
    return await TasksRepository.listById(taskIdList);
}

function deleteTask(taskId) {
    Validators.isNotNull(taskId, 'No task id was provided!');

    TasksRepository.deleteTask(taskId);
}

async function deleteMultiple(taskIds) {
    Validators.isNotNull(taskIds, 'No task ids provided');

    // TODO: Optimize this so it doesn't call the database so many times
    await taskIds
        .forEach(async taskId => await TasksRepository.deleteTask(taskId));
}

module.exports.TaskServices = {
    create
    , createMultiple
    , update
    , list
    , listById
    , deleteTask
    , deleteMultiple
}