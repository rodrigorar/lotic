const { EventBus, EventType, EventSubscriber } = require("../../shared/event-bus");
const { Validators } = require("../../shared/utils/utils");
const { TasksRepository, Task } = require("./data");
const { v4 } = require("uuid");

async function create(taskData) {
    Validators.isNotNull(taskData, 'No task data was provided!');
    
    const task = 
        new Task(
            taskData.id
            , taskData.title
            , taskData.createdAt
            , taskData.updatedAt
            , taskData.ownerId);
    await TasksRepository.createTask(task);
}

async function createMultiple(tasksData) {
    Validators.isNotNull(tasksData, 'No tasks where provided');

    tasksData
        .map(taskData => 
                new Task(
                    taskData.id
                    , taskData.title
                    , taskData.createdAt
                    , taskData.updatedAt
                    , taskData.ownerId))
        .forEach(async task => await TasksRepository.createTask(task));
}

function update(taskId, taskData) {
    Validators.isNotNull(taskId, 'No task id was provided!');
    Validators.isNotNull(taskData, 'No task data was provided!');

    TasksRepository.updateTask(taskId, taskData);
}

async function list(accountId) {
    Validators.isNotNull(accountId, 'No accountId provided');

    return await TasksRepository.listTasks(accountId);
}

async function listTasksWithoutOwner() {
    return await TasksRepository.listTasksWithoutOwner();
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

    await taskIds
        .forEach(async taskId => await TasksRepository.deleteTask(taskId));
}

async function deleteAllForAccount(accountId) {
    Validators.isNotNull(accountId, 'No account id is provided');
    await TasksRepository.deleteAllForAccount(accountId);
}

module.exports.TaskServices = {
    create
    , createMultiple
    , update
    , list
    , listTasksWithoutOwner
    , listById
    , deleteTask
    , deleteMultiple
    , deleteAllForAccount
}

// Event Bus Subscribers

EventBus.register(
    EventType.LOGIN_SUCCESS
    , new EventSubscriber(v4(), async (event) => {
        const tasksWithoutOwner = await listTasksWithoutOwner();
        tasksWithoutOwner.forEach(async (task) => { 
            task.ownerId = event.body.account_id;
            await TasksRepository.updateTaskOwner(task)
        });
    }));