const { HttpClient } = require("../../shared/http/http");

const BASE_PATH = "/tasks";

async function createTasks(unitOfWork, taskList) {
    const result = await HttpClient.post(unitOfWork, BASE_PATH, {
        tasks: taskList
    });
    return result.data != undefined ? result.data : result.response.data;
}

async function updateTasks(unitOfWork, taskList) {
    const result = await HttpClient.put(unitOfWork, BASE_PATH, {
        tasks: taskList
    });
    // TODO: Deal with any 4xx or 5xx that my happend
    return result.data ? result.data : "";
}

async function listTasks(unitOfWork, account_id) {
    return await HttpClient.get(unitOfWork, `${BASE_PATH}?account_id=` + account_id);
}

async function deleteTasks(unitOfWork, taskId) {
    await HttpClient.del(unitOfWork, `${BASE_PATH}/` + taskId)
}

module.exports.TasksRPC = {
    createTasks,
    updateTasks,
    listTasks,
    deleteTasks
}