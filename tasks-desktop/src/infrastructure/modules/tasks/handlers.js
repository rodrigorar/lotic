const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { 
    UseCaseCreateTaskProvider
    , UseCaseUpdateTaskProvider
    , UseCaseDeleteTaskProvider
    , UseCaseDeleteAllTasksForAccountProvider
    , UseCaseListTasksForAccountProvider
    , UseCaseListTasksWithoutOwnerProvider
    , UseCaseCreateTaskSyncProvider
    , UseCaseMarkTaskSyncsSyncedProvider,
    UseCaseMarkTaskSyncForRemovalProvider,
    UseCaseDeleteAllTaskSyncsForAccountProvider,
    UseCaseMarkTaskSyncDirtyProvider
} = require("./providers");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { TASK_SYNC_STATUS, UseCaseDeleteAllTaskSyncsForAccount } = require("../../../domain/modules/tasks/domain");

async function handleCreateTask(event, newTask) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseCreateTask = UseCaseCreateTaskProvider.get();
    const useCaseCreateTasksSync = UseCaseCreateTaskSyncProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    
        if (activeSession != undefined) {
            newTask.ownerId = activeSession.accountId;
        }

        useCaseCreateTask
            .execute(unitOfWork, newTask)
            .then(() => useCaseCreateTasksSync.execute(unitOfWork, newTask.id));
    });
}

async function handleUpdateTasks(event, taskId, data) {
    const useCaseUpdateTaskProvider = UseCaseUpdateTaskProvider.get();
    const useCaseMarkTaskSyncDirty = UseCaseMarkTaskSyncDirtyProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseUpdateTaskProvider.execute(unitOfWork, data);
        useCaseMarkTaskSyncDirty.execute(unitOfWork, [taskId]);
    });
}

async function handleCompletion(event, taskId) {
    const useCaseEraseTask = UseCaseDeleteTaskProvider.get();
    const useCaseMarkTaskSyncsForRemoval = UseCaseMarkTaskSyncForRemovalProvider.get();
    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseEraseTask.execute(unitOfWork, taskId);
        useCaseMarkTaskSyncsForRemoval.execute(unitOfWork, taskId);
    });
}

async function handleListTasks(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseListTasksForAccount = UseCaseListTasksForAccountProvider.get();
    const useCaseListTasksWithoutOwner = UseCaseListTasksWithoutOwnerProvider.get();

    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);

        if (activeSession != undefined) {
            return await useCaseListTasksForAccount.execute(unitOfWork, activeSession.accountId);
        } else {
            return await useCaseListTasksWithoutOwner.execute(unitOfWork);
        }
    });
}

async function handleLogout(event, accountId) {
    const useCaseDeleteAllTasksForAccount = UseCaseDeleteAllTasksForAccountProvider.get();
    const useCaseDeleteAllTaskSyncsForAccount = UseCaseDeleteAllTaskSyncsForAccountProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseDeleteAllTaskSyncsForAccount.execute(unitOfWork, accountId);
        await useCaseDeleteAllTasksForAccount.execute(unitOfWork, accountId);
    });
}

module.exports.TasksHandler = {
    handleCreateTask
    , handleUpdateTasks
    , handleCompletion
    , handleListTasks
    , handleLogout
}