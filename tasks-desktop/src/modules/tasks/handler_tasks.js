const { TaskServicesInstance } = require('./services');
const { TasksSyncServicesInstance } = require('../tasks_synch/services');
const { UseCaseGetActiveSessionProvider } = require('../../infrastructure/modules/auth/providers');
const { RunUnitOfWork } = require('../../shared/persistence/unitofwork');
const { TASK_SYNCH_STATUS } = require('../tasks_synch/data');

async function handleCreateTask(event, newTask) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        TaskServicesInstance
            .create(unitOfWork, newTask)
            .then(() => {
                TasksSyncServicesInstance.createSyncMonitor(
                    unitOfWork
                    , newTask.id
                    , TASK_SYNCH_STATUS["LOCAL"]);
            });
    });
}

async function handleUpdateTasks(event, taskId, data) {

    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServicesInstance.update(unitOfWork, data);
        TasksSyncServicesInstance.markDirty(unitOfWork, taskId);
    });
}

async function handleCompletion(event, taskId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TaskServicesInstance.deleteTask(unitOfWork, taskId);
        TasksSyncServicesInstance.markForRemoval(unitOfWork, taskId);
    }) ;
}

async function handleListTasks(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);

        if (activeSession != undefined) {
            return await TaskServicesInstance.list(unitOfWork, activeSession.accountId);
        } else {
            return await TaskServicesInstance.listTasksWithoutOwner(unitOfWork);
        }
    });
}

async function handleLogout(event, accountId) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        await TasksSyncServicesInstance.deleteAllForAccount(unitOfWork, accountId);
        await TaskServicesInstance.deleteAllForAccount(unitOfWork, accountId);
    });
}

module.exports.TasksHandler = {
    handleCreateTask
    , handleUpdateTasks
    , handleCompletion
    , handleListTasks
    , handleLogout
}