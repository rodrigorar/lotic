const { TaskServices } = require('./services');
const { TasksSyncServices } = require('../tasks_synch/services');
const { AuthServicesInstance } = require('../auth/services');
const { RunUnitOfWork } = require('../../shared/persistence/unitofwork');
const { TASK_SYNCH_STATUS } = require('../tasks_synch/data');

async function handleCreateTask(event, newTask) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await AuthServicesInstance.getActiveSession(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        TaskServices
            .create(unitOfWork, newTask)
            .then(() => {
                TasksSyncServices.createSyncMonitor(
                    unitOfWork
                    , newTask.id
                    , TASK_SYNCH_STATUS["LOCAL"]);
            });
    });
}

async function handleUpdateTasks(event, taskId, data) {

    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServices.update(unitOfWork, data);
        TasksSyncServices.markDirty(unitOfWork, taskId);
    });
}

async function handleCompletion(event, taskId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServices.deleteTask(unitOfWork, taskId);
        TasksSyncServices.markForRemoval(unitOfWork, taskId);
    }) ;
}

async function handleListTasks(event) {
    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await AuthServicesInstance.getActiveSession(unitOfWork);

        if (activeSession != undefined) {
            return await TaskServices.list(unitOfWork, activeSession.accountId);
        } else {
            return await TaskServices.listTasksWithoutOwner(unitOfWork);
        }
    });
}

async function handleLogout(event, accountId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TasksSyncServices.deleteAllForAccount(unitOfWork, accountId);
        await TaskServices.deleteAllForAccount(unitOfWork, accountId);
    });
}

module.exports.TasksHandler = {
    handleCreateTask
    , handleUpdateTasks
    , handleCompletion
    , handleListTasks
    , handleLogout
}