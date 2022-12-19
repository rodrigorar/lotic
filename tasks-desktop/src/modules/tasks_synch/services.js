const { ServiceUtils } = require("../shared/service-utils");
const { Validators } = require("../shared/utils");
const { TaskSynchRepository } = require("./data");

function createSynchMonitor(taskId) {
    ServiceUtils.errorWrapper(() => {
        Validators.isNotNull(taskId, 'No task id was provided!');
        TaskSynchRepository.create(taskId);
    })
}

function removeSynched() {
    ServiceUtils.errorWrapper(() => {
        TaskSynchRepository.cleanup();
    });
}

function markDirty(taskId) {
    ServiceUtils.errorWrapper(() => {
        Validators.isNotNull(taskId, 'No task id was provided!');
        TaskSynchRepository.markDirty(taskId);
    });
}

async function getNonSynched() {
    return await ServiceUtils.asyncErrorWrapper(async () => {
        return await TaskSynchRepository.getLocalAndDirty();
    });
}

module.exports.TasksSynchServices = {
    createSynchMonitor,
    removeSynched,
    markDirty,
    getNonSynched
}