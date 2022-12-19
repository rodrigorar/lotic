const { Logger } = require("../../handlers/logging");
const { HttpClient } = require("../shared/http");
const { generateId } = require("../shared/utils");


async function createTasks(taskList) {
    Logger.trace('Calling Create Tasks');

    await HttpClient.post('/api/v1/tasks', {
        userId: '',
        requestId: `${generateId()}`,
        tasks: taskList
    });
}

async function updateTasks(taskList) {
    Logger.trace('Calling Update Tasks: Not Implemented');

    // TODO: Not implemented
}

async function listTasks() {
    Logger.trace('Calling List Tasks: Not Implemented');

    // TODO: Not Implemented
}

async function deleteTasks(taskIdList) {
    Logger.trace('Calling Delete Tasks: Not Implemented');

    // TODO: Not Implemented
}

module.exports.TasksRPC = {
    createTasks,
    updateTasks,
    listTasks,
    deleteTasks
}