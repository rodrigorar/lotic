const { Logger } = require("../shared/logger");
const { HttpClient } = require("../shared/http");

const BASE_PATH = "/tasks";

async function createTasks(taskList) {
    const result = await HttpClient.post(BASE_PATH, {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data;
}

async function updateTasks(taskList) {
    Logger.trace('Calling Update Tasks: Not Implemented');

    const result = await HttpClient.put(BASE_PATH, {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data ? result.data : "";
}

async function listTasks(account_id) {
    result = await HttpClient.get(`${BASE_PATH}?account_id=` + account_id);
    // TODO: Transform the result to a tasks dto
}

async function deleteTasks(taskId) {
    Logger.trace('Calling Delete Tasks: Not Implemented');

    await HttpClient.del(`${BASE_PATH}/` + taskId)
}

module.exports.TasksRPC = {
    createTasks,
    updateTasks,
    listTasks,
    deleteTasks
}