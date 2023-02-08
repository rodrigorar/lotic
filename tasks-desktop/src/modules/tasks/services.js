const { Validators } = require("../shared/utils");
const { TasksRepository, Task, TASK_STATE } = require("./data");

function create(taskData) {
    Validators.isNotNull(taskData, 'No task data was provided!');

    const task = 
        new Task(
            taskData.id
            , taskData.title
            , TASK_STATE[taskData.state]
            , taskData.createdAt
            , taskData.updatedAt);
    TasksRepository.createTask(task);
}

function createMultiple(tasksData) {
    Validators.isNotNull(tasksData, 'No tasks where provided');

    // TODO: Optimize this so it doesn't call the database so many times
    tasksData
        .map(taskData => 
                new Task(
                    taskData.id
                    , taskData.title
                    , TASK_STATE.IN_TODO
                    , taskData.createdAt
                    , taskData.updatedAt))
        .forEach(task => TasksRepository.createTask(task));
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

function erase(taskId) {
    Validators.isNotNull(taskId, 'No task id was provided!');

    TasksRepository.deleteTask(taskId);
}

function eraseMultiple(taskIds) {
    Validators.isNotNull(taskIds, 'No task ids provided');

    // TODO: Optimize this so it doesn't call the database so many times
    taskIds
        .forEach(taskId => TasksRepository.deleteTask(taskId));
}

module.exports.TaskServices = {
    create
    , createMultiple
    , update
    , list
    , listById
    , erase
    , eraseMultiple
}