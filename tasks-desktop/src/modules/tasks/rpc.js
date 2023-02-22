const { HttpClient } = require("../../shared/http/http");

const BASE_PATH = "/tasks";

async function createTasks(taskList) {
    const result = await HttpClient.post(BASE_PATH, {
        tasks: taskList
    });
    return result.data != undefined ? result.data : result.response.data;
}

async function updateTasks(taskList) {
    const result = await HttpClient.put(BASE_PATH, {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data ? result.data : "";
}

async function listTasks(account_id) {
    return await HttpClient.get(`${BASE_PATH}?account_id=` + account_id);
}

async function deleteTasks(taskId) {
    await HttpClient.del(`${BASE_PATH}/` + taskId)
}

module.exports.TasksRPC = {
    createTasks,
    updateTasks,
    listTasks,
    deleteTasks
}