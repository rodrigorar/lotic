const { HttpClient } = require("../../http/http");
const { Gateway } = require("../../../domain/shared/ports");

const BASE_PATH = "/tasks";

class CreateTasksGateway extends Gateway {

    constructor() {
        super();
    }

    async call(unitOfWork, taskList) {
        const result = await HttpClient.post(unitOfWork, BASE_PATH, {
            tasks: taskList
        });
        return result.data != undefined ? result.data : result.response.data;
    }
}

class UpdateTasksGateway extends Gateway {

    constructor() {
        super();
    }

    async call(unitOfWork, taskList) {
        const result = await HttpClient.put(unitOfWork, BASE_PATH, {
            tasks: taskList
        });
        // TODO: Deal with any 4xx or 5xx that my happend
        return result.data ? result.data : "";
    }
}

class ListTasksGateway extends Gateway {

    constructor() {
        super();
    }

    async call(unitOfWork, accountId) {
        return await HttpClient.get(unitOfWork, `${BASE_PATH}?account_id=` + accountId);
    }
}

class DeleteTasksGateway extends Gateway {

    constructor() {
        super();
    }

    async call(unitOfWork, taskId) {
        await HttpClient.del(unitOfWork, `${BASE_PATH}/` + taskId)
    }
}

module.exports.CreateTasksGateway = CreateTasksGateway;
module.exports.UpdateTasksGateway = UpdateTasksGateway;
module.exports.ListTasksGateway = ListTasksGateway;
module.exports.DeleteTasksGateway = DeleteTasksGateway;