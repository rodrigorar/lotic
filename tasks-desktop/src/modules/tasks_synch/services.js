const { ServiceUtils } = require("../shared/service-utils");
const { Validators } = require("../shared/utils");
const { TaskSynchRepository } = require("./data");

async function createSynchMonitor(taskId) {
    await ServiceUtils.asyncErrorWrapper(async () => {
        Validators.isNotNull(taskId, 'No task id was provided!');
        await TaskSynchRepository.create(taskId);
    })
}

async function markForRemoval(taskId) {
    await ServiceUtils.asyncErrorWrapper(async () => {
        await TaskSynchRepository.markForRemoval(taskId);
    });
}

async function markDirty(taskId) {
    await ServiceUtils.asyncErrorWrapper(async () => {
        Validators.isNotNull(taskId, 'No task id was provided!');
        await TaskSynchRepository.markDirty(taskId);
    });
}

async function markSynched(taskIds) {
    await ServiceUtils.asyncErrorWrapper(async () => {
        Validators.isNotNull(taskIds, 'No task ids were provided');
        await TaskSynchRepository.markSynched(taskIds);
    });
}

async function getNonSynched() {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.getLocalAndDirty();
    });
}

module.exports.TasksSynchServices = {
    createSynchMonitor,
    markForRemoval,
    markDirty,
    markSynched,
    getNonSynched
}