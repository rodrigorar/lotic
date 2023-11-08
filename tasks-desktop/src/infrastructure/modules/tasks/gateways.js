const { HttpClient } = require("../../http/http");

const BASE_PATH = "/tasks";

const CreateTasksGateway = (() => {
    const call = async (unitOfWork, taskList) => {
        const result = await HttpClient.post(unitOfWork, BASE_PATH, {
            tasks: taskList
        });
        return result.data != undefined ? result.data : result.response.data;
    }

    return {
        call
    }
})();

const UpdateTasksGateway = (() => {
    const call = async (unitOfWork, taskList) => {
        const result = await HttpClient.put(unitOfWork, BASE_PATH, {
            tasks: taskList
        });
        // TODO: Deal with any 4xx or 5xx that my happend
        return result.data ? result.data : "";
    }

    return {
        call
    }
})();

const ListTasksGateway = (() => {
    const call = async (unitOfWork, accountId) => {
        return await HttpClient.get(unitOfWork, `${BASE_PATH}?account_id=` + accountId);
    }

    return {
        call
    }
})();

const DeleteTasksGateway = (() => {
    const call = async (unitOfWork, taskId) => {
        await HttpClient.del(unitOfWork, `${BASE_PATH}/` + taskId)
    }

    return {
        call
    }
})();

module.exports.CreateTasksGateway = CreateTasksGateway;
module.exports.UpdateTasksGateway = UpdateTasksGateway;
module.exports.ListTasksGateway = ListTasksGateway;
module.exports.DeleteTasksGateway = DeleteTasksGateway;