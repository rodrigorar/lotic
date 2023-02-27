const { ServiceUtils } = require("../../shared/utils/service-utils");
const { Validators } = require("../../shared/utils/utils");
const { TaskSynchRepository } = require("./data");

async function createSynchMonitor(taskId, state = undefined) {
    await ServiceUtils.asyncErrorWrapper(async () => {
        Validators.isNotNull(taskId, 'No task id was provided!');
        await TaskSynchRepository.create(taskId, state);
    })
}

async function deleteComplete() {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.deleteComplete();
    });
}

async function deleteMultipleByTaskId(taskIds) {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.deleteMultipleByTaskId(taskIds);
    });
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

async function getComplete() {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.getComplete();
    });
}

async function getSynchStatus(taskId) {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.getSynchStatus(taskId);
    });
}

module.exports.TasksSynchServices = {
    createSynchMonitor
    , deleteComplete
    , deleteMultipleByTaskId
    , markForRemoval
    , markDirty
    , markSynched
    , getNonSynched
    , getComplete
    , getSynchStatus
}