const { Logger } = require("../shared/logger");
const { HttpClient } = require("../shared/http");
const { generateId } = require("../shared/utils");


async function createTasks(taskList) {
    const result = await HttpClient.post('/api/v1/tasks', {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data;
}

async function updateTasks(taskList) {
    Logger.trace('Calling Update Tasks: Not Implemented');

    const result = await HttpClient.put('/api/v1/tasks', {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data ? result.data : "";
}

async function listTasks(account_id) {
    result = await HttpClient.get('/api/v1/tasks?account_id=' + account_id);
    console.log('Result in stuff');
    console.log(result);
    // TODO: Transform the result to a tasks dto
}

async function deleteTasks(taskIdList) {
    Logger.trace('Calling Delete Tasks: Not Implemented');

    await HttpClient.delete('/api/v1/tasks')
}

module.exports.TasksRPC = {
    createTasks,
    updateTasks,
    listTasks,
    deleteTasks
}