const { Validators } = require("../shared/utils");

class Task {
    constructor(id, title, position, syncStatus, createdAt, updatedAt, ownerId) {
        this.id = id;
        this.title = title;
        this.position = position;
        this.syncStatus = syncStatus
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
    }
}

const TASK_SYNC_STATUS = {
    LOCAL: "LOCAL", // The task was never synched
    SYNCED: "SYNCED", // The task is synched and hasn't been changed locally
    DIRTY: "DIRTY", // The task is synched but has been changed locally
    COMPLETE: "COMPLETE" // The task is competed and has not been synched with the server yet. 
}

class TaskSync {
    constructor(id, taskId, status, createdAt, updatedAt) {
        this.id = id;
        this.taskId = taskId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

// Tasks Use Case

const UseCaseCreateTask = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskData) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data was provided!");

        if (taskData.position == undefined) {
            taskData.position = await tasksRepository.getMaxPosition(unitOfWork) + 1;
        }

        const task = 
            new Task(
                taskData.id
                , taskData.title
                , taskData.position
                , taskData.syncStatus != undefined ? taskData.syncStatus : TASK_SYNC_STATUS.LOCAL
                , taskData.createdAt
                , taskData.updatedAt
                , taskData.ownerId);
        await tasksRepository.save(unitOfWork, task);
        await taskSyncRepository.save(
            unitOfWork
            , taskData.id
            , taskData.syncStatus ? taskData.syncStatus : TASK_SYNC_STATUS.LOCAL);
    }

    return {
        execute
    }
}

const UseCaseCreateTasks = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskDataList) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskDataList, "No tasks where provided");

        let maxPosition = await tasksRepository.getMaxPosition(unitOfWork);
    
        for (let taskData of taskDataList) {
            if (! taskData.position) {
                maxPosition++;
                taskData.position = maxPosition;
            }
            
            await tasksRepository.save(unitOfWork, new Task(
                taskData.id
                , taskData.title
                , taskData.position
                , taskData.syncStatus
                , taskData.createdAt
                , taskData.updatedAt
                , taskData.ownerId));
            await taskSyncRepository.save(
                unitOfWork
                , taskData.id
                , taskData.syncStatus ? taskData.syncStatus : TASK_SYNC_STATUS.LOCAL)
        }
    }

    return {
        execute
    }
}

// FIXME: Task list position is not being maintained after sync with server
const UseCaseUpdateTask = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskData) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data provided");

        await tasksRepository.update(unitOfWork, taskData);
        await taskSyncRepository.update(unitOfWork, {
            taskId: taskData.id
            , status: taskData.syncStatus != undefined ? taskData.syncStatus : TASK_SYNC_STATUS.DIRTY
            , notCondition: TASK_SYNC_STATUS.LOCAL
        });
    }

    return {
        execute
    }
}

const UseCaseUpdateTasks = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskDataList) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskDataList, "No task data list provided");

        for (let taskData of taskDataList) {
            await taskSyncRepository.update(unitOfWork, {
                taskId: taskData.id
                , status: taskData.syncStatus != undefined ? taskData.syncStatus : TASK_SYNC_STATUS.DIRTY
                , notCondition: TASK_SYNC_STATUS.LOCAL
            });
            await tasksRepository.update(unitOfWork, taskData)
        }
    }

    return {
        execute
    }
}

const UseCaseGetTaskById = (tasksRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        return await tasksRepository.get(unitOfWork, taskId);
    }

    return {
        execute
    }
}

const UseCaseGetBySyncStatus = (tasksRepository) => {
    const execute = async (unitOfWork, syncStatus) => {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(syncStatus, "No sync status provided");

        return await tasksRepository.getBySyncState(unitOfWork, syncStatus);
    }

    return {
        execute
    }
}

const UseCaseListTasksForAccount = (tasksRepository) => {
    const execute = async (unitOfWork, accountId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");
        
        const result = await tasksRepository.listByAccountId(unitOfWork, accountId);
        result.sort((a, b) => a.position - b.position);
        return result;
    }

    return {
        execute
    }
}

const UseCaseListTasksWithoutOwner = (tasksRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await tasksRepository.listWithoutOwner(unitOfWork);
    }

    return {
        execute
    }
}

const UseCaseListTasksById = (tasksRepository) => {
    const execute = async (unitOfWork, taskIdList = []) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        const result = await tasksRepository.listById(unitOfWork, taskIdList);
        result.sort((a, b) => a.position - b.position);
        return result;
    }

    return {
        execute
    }
}

const UseCaseDeleteTask = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        const existingTask = await tasksRepository.get(unitOfWork, taskId);
        if (existingTask) {
            if (existingTask.ownerId) {
                await taskSyncRepository.update(
                    unitOfWork
                    , { taskId: existingTask.id, status: TASK_SYNC_STATUS.COMPLETE });
            } else {
                await taskSyncRepository.eraseByTaskIds(unitOfWork, [existingTask.id]);
            }

            await tasksRepository.erase(unitOfWork, existingTask.id);
        }
    }

    return {
        execute
    }
}

const UseCaseDeleteTasks = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, taskIds = []) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        await taskSyncRepository.eraseByTaskIds(unitOfWork, taskIds);
        for (let taskId of taskIds) {
            await tasksRepository.erase(unitOfWork, taskId)
        }
    }

    return {
        execute
    }
}

const UseCaseDeleteAllTasksForAccount = (tasksRepository, taskSyncRepository) => {
    const execute = async (unitOfWork, accountId) => {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        // TODO: This should use the standard Repository API and not a specific method
        await taskSyncRepository.eraseAllForAccount(unitOfWork, accountId);
        await tasksRepository.eraseAllForAccount(unitOfWork, accountId);
    }

    return {
        execute
    }
}

const UseCaseUpdateTaskOwner = (tasksRepository) => {
    const execute = async (unitOfWork, taskData) => {
        tasksRepository.update(unitOfWork, taskData);
    }

    return {
        execute
    }
}

// Tasks Sync Use Cases

const UseCaseMarkTaskSyncsSynced = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskIds) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        const tasksSyncData = taskIds.map((id) => ({
            taskId: id
            , status: TASK_SYNC_STATUS.SYNCED
        }));

        for (let taskSync of tasksSyncData) {
            await taskSyncRepository.update(unitOfWork, taskSync);
        }
    }

    return {
        execute
    }
}

module.exports.Task = Task;
module.exports.TaskSync = TaskSync;
module.exports.TASK_SYNC_STATUS = TASK_SYNC_STATUS;

module.exports.UseCaseCreateTask = UseCaseCreateTask;
module.exports.UseCaseCreateTasks = UseCaseCreateTasks;
module.exports.UseCaseUpdateTask = UseCaseUpdateTask;
module.exports.UseCaseUpdateTasks = UseCaseUpdateTasks;
module.exports.UseCaseGetTaskById = UseCaseGetTaskById;
module.exports.UseCaseGetBySyncStatus = UseCaseGetBySyncStatus;
module.exports.UseCaseListTasksForAccount = UseCaseListTasksForAccount;
module.exports.UseCaseListTasksWithoutOwner = UseCaseListTasksWithoutOwner;
module.exports.UseCaseListTasksById = UseCaseListTasksById;
module.exports.UseCaseDeleteTask = UseCaseDeleteTask;
module.exports.UseCaseDeleteTasks = UseCaseDeleteTasks;
module.exports.UseCaseDeleteAllTasksForAccount = UseCaseDeleteAllTasksForAccount;
module.exports.UseCaseUpdateTaskOwner = UseCaseUpdateTaskOwner;

module.exports.UseCaseMarkTaskSyncsSynced = UseCaseMarkTaskSyncsSynced;