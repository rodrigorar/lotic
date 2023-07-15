const { NotImplementedError } = require("../../errors");
const { Repository } = require("../../shared/ports");

class TasksRepository extends Repository {
 
    async listByAccountId(unitOfWork, accountId) {
        throw new NotImplementedError("TasksRepository#listByAccountId is not implemented");
    }

    async listWithoutOwner(unitOfWork) {
        throw new NotImplementedError("TasksRepository#listWithNoOwner is not implemented");
    }

    async listById(unitOfWork, taskIds = []) {
        throw new NotImplementedError("TasksRepository#listById is not implemented");
    }

    // FIXME: This should be on the save function
    async update(unitOfWork, taskData) {
        throw new NotImplementedError("TasksRepository#update is not implemented");
    }

    // FIXME: This should be on the save function
    async updateTasksOwner(unitOfWork, taskData) {
        throw new NotImplementedError("TasksRepository#updateTasksOwner is not implemented");
    }

    async erase(unitOfWork, taskId) {
        throw new NotImplementedError("TasksRepository#erase is not implemented");
    }

    async eraseAllForAccount(unitOfWork, accountId) {
        throw new NotImplementedError("TasksRepository#eraseAllForAccount is not implemented");
    }
}

class TasksSyncRepository extends Repository {

    // FIXME: This should be done through the save function
    async markDirty(unitOfWork, taskId) {
        throw new NotImplementedError("TasksSyncRepository#markDirty is not implemented");
    }

    // FIXME: This should be done through the get function
    async getLocalAndDirty(unitOfWork) {
        throw new NotImplementedError("TasksSyncRepository#getLocalAndDirty is not implemented");
    }

    // FIXME: This should be done through the get function
    async getComplete(unitOfWork) {
        throw new NotImplementedError("TasksSyncRepository#getComplete is not implemented");
    }

    // FIXME: This should be in the save function
    async update(unitOfWork, taskSyncData) {
        throw new NotImplementedError("TasksSyncRepository#update is not implemented");
    }

    // FIXME: This should be done through a saveAll function
    async updateMultiple(unitOfWork, taskSyncDataList) {
        throw new NotImplementedError("TasksSyncRepository#updateMultiple is not implemented");
    }

    // FIXME: This should be done through the erase function
    async eraseComplete(unitOfWork) {
        throw new NotImplementedError("TasksSyncRepository#eraseComplete is not implemented");
    }

    // FIXME: This should be done through the eraseAll function
    async eraseByTaskIds(unitOfWork, taskIds) {
        throw new NotImplementedError("TasksSyncRepository#eraseByTaskIds is not implemented");
    }

    // FIXME: This should be done through the erase function
    async eraseAllForAccount(unitOfWork, accountId) {
        throw new NotImplementedError("TasksSyncRepository#eraseAllForAccount is not implemented");
    }
}

module.exports.TasksRepository = TasksRepository;
module.exports.TaskSyncRepository = TasksSyncRepository;