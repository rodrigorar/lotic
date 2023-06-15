const { ServiceUtils } = require("../../shared/utils/service-utils");
const { Validators } = require("../../shared/utils/utils");
const { TaskSynchRepository, TasksSyncRepository, TASK_SYNCH_STATUS } = require("./data");

class TasksSyncServices {

    constructor(tasksSyncRepository) {
        this.tasksSyncRepository = tasksSyncRepository;
    }

    async createSyncMonitor(unitOfWork, taskId, state = undefined) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksSyncRepository.create(unitOfWork, taskId, state);
    }

    async createMultipleSyncMonitor(unitOfWork, tasksSyncData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksSyncData, "No task sync data provided");

        for (let taskSyncData of tasksSyncData) {
            await this.tasksSyncRepository.create(unitOfWork, taskSyncData.taskId, taskSyncData.status);
        }
    }

    async deleteComplete(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        await this.tasksSyncRepository.deleteComplete(unitOfWork);
    }

    async deleteMultipleByTaskId(unitOfWork, taskIds) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        await this.tasksSyncRepository.deleteMultipleByTaskId(unitOfWork, taskIds);
    }

    async deleteAllForAccount(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        await this.tasksSyncRepository.deleteAllForAccount(unitOfWork, accountId);
    }

    async markForRemoval(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksSyncRepository.update(unitOfWork, { taskId: taskId, status: TASK_SYNCH_STATUS["COMPLETE"] });
    }

    async markDirty(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksSyncRepository.markDirty(unitOfWork, taskId);
    }

    async markSynced(unitOfWork, taskIds) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        const tasksSyncData = taskIds.map((id) => ({
            taskId: id
            , status: TASK_SYNCH_STATUS["SYNCHED"]
        }));
        await this.tasksSyncRepository.updateMultiple(unitOfWork, tasksSyncData);
    }

    async getNonSynced(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksSyncRepository.getLocalAndDirty(unitOfWork);
    }

    async getComplete(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksSyncRepository.getComplete(unitOfWork);
    }

    async getSyncStatus(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        return await this.tasksSyncRepository.getSyncStatus(unitOfWork, taskId);
    }
}

module.exports.TasksSyncServices = new TasksSyncServices(new TasksSyncRepository());