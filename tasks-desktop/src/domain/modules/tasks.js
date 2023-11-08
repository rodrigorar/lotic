const { Validators } = require("../shared/utils");

class Task {
    constructor(id, title, position, createdAt, updatedAt, ownerId) {
        this.id = id;
        this.title = title;
        this.position = position;
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

const UseCaseCreateTask = (tasksRepository) => {
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
                , taskData.createdAt
                , taskData.updatedAt
                , taskData.ownerId);
        await tasksRepository.save(unitOfWork, task);
    }

    return {
        execute
    }
}

const UseCaseCreateTasks = (tasksRepository) => {
    const execute = async (unitOfWork, taskDataList) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskDataList, "No tasks where provided");

        let maxPosition = await tasksRepository.getMaxPosition(unitOfWork);
    
        const tasks = taskDataList
            .map(taskData => {
                
                if (! taskData.position) {
                    maxPosition++;
                    taskData.position = maxPosition;
                }

                return new Task(
                    taskData.id
                    , taskData.title
                    , taskData.position
                    , taskData.createdAt
                    , taskData.updatedAt
                    , taskData.ownerId)
            });
        for (let task of tasks) {
            await tasksRepository.save(unitOfWork, task);
        }
    }

    return {
        execute
    }
}

const UseCaseUpdateTask = (tasksRepository) => {
    const execute = async (unitOfWork, taskData) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data provided");

        await tasksRepository.update(unitOfWork, taskData);
    }

    return {
        execute
    }
}

const UseCaseUpdateTasks = (tasksRepository) => {
    const execute = async (unitOfWork, taskDataList) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskDataList, "No task data list provided");

        for (let taskData of taskDataList) {
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

const UseCaseDeleteTask = (tasksRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await tasksRepository.erase(unitOfWork, taskId);
    }

    return {
        execute
    }
}

const UseCaseDeleteTasks = (tasksRepository) => {
    const execute = async (unitOfWork, taskIds = []) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        for (let taskId of taskIds) {
            await tasksRepository.erase(unitOfWork, taskId)
        }
    }

    return {
        execute
    }
}

const UseCaseDeleteAllTasksForAccount = (tasksRepository) => {
    const execute = async (unitOfWork, accountId) => {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        // TODO: This should use the standard Repository API and not a specific method
        tasksRepository.eraseAllForAccount(unitOfWork, accountId);
    }

    return {
        execute
    }
}

const UseCaseUpdateTaskOwner = (tasksRepository) => {
    const execute = async (unitOfWork, taskData) => {
        this.tasksRepository.updateTaskOwner(unitOfWork, data);
    }

    return {
        execute
    }
}

// Tasks Sync Use Cases
// FIXME: These use cases should coalesce with the use cases from the Tasks since
//  the Tasks entity is the aggregate root of this module. 

const UseCaseCreateTaskSync = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await taskSyncRepository.save(unitOfWork, taskId, TASK_SYNC_STATUS["LOCAL"]);
    }

    return {
        execute
    }
}

const UseCaseCreateTaskSyncs = (taskSyncRepository) => {
    const execute = async (unitOfWork, tasksSyncData) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksSyncData, "No task sync data provided");

        for (let taskSyncData of tasksSyncData) {
            await taskSyncRepository.save(unitOfWork, taskSyncData.taskId, taskSyncData.status);
        }
    }

    return {
        execute
    }
}

const UseCaseDeleteCompleteTaskSyncs = (taskSyncRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        await taskSyncRepository.eraseComplete(unitOfWork);
    }

    return {
        execute
    }
}

const UseCaseDeleteTaskSyncsByTaskIds = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskIds) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        await taskSyncRepository.eraseByTaskIds(unitOfWork, taskIds);
    }

    return {
        execute
    }
}

const UseCaseDeleteAllTaskSyncsForAccount = (taskSyncRepository) => {
    const execute = async (unitOfWork, accountId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        await taskSyncRepository.eraseAllForAccount(unitOfWork, accountId);
    }

    return {
        execute
    }
}

const UseCaseMarkTaskSyncForRemoval = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await taskSyncRepository.update(unitOfWork, { taskId: taskId, status: TASK_SYNC_STATUS["COMPLETE"] });
    }

    return {
        execute
    }
}

const UseCaseMarkTaskSyncDirty = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await taskSyncRepository.markDirty(unitOfWork, taskId);
    }

    return {
        execute
    }
}

const UseCaseMarkTaskSyncsSynced = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskIds) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        const tasksSyncData = taskIds.map((id) => ({
            taskId: id
            , status: TASK_SYNC_STATUS["SYNCED"]
        }));
        await taskSyncRepository.updateMultiple(unitOfWork, tasksSyncData);
    }

    return {
        execute
    }
}

const UseCaseGetNonSyncedTaskSyncs = (taskSyncRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        return await taskSyncRepository.getLocalAndDirty(unitOfWork);
    }

    return {
        execute
    }
}

const UseCaseGetCompleteTaskSyncs = (taskSyncRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        return await taskSyncRepository.getComplete(unitOfWork);
    }

    return {
        execute
    }
}

const UseCaseGetTaskSyncByTaskId = (taskSyncRepository) => {
    const execute = async (unitOfWork, taskId) => {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        return await taskSyncRepository.get(unitOfWork, taskId);
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
module.exports.UseCaseListTasksForAccount = UseCaseListTasksForAccount;
module.exports.UseCaseListTasksWithoutOwner = UseCaseListTasksWithoutOwner;
module.exports.UseCaseListTasksById = UseCaseListTasksById;
module.exports.UseCaseDeleteTask = UseCaseDeleteTask;
module.exports.UseCaseDeleteTasks = UseCaseDeleteTasks;
module.exports.UseCaseDeleteAllTasksForAccount = UseCaseDeleteAllTasksForAccount;
module.exports.UseCaseUpdateTaskOwner = UseCaseUpdateTaskOwner;

module.exports.UseCaseCreateTaskSync = UseCaseCreateTaskSync;
module.exports.UseCaseCreateTaskSyncs = UseCaseCreateTaskSyncs;
module.exports.UseCaseDeleteCompleteTaskSyncs = UseCaseDeleteCompleteTaskSyncs;
module.exports.UseCaseDeleteTaskSyncsByTaskIds = UseCaseDeleteTaskSyncsByTaskIds;
module.exports.UseCaseDeleteAllTaskSyncsForAccount = UseCaseDeleteAllTaskSyncsForAccount;
module.exports.UseCaseMarkTaskSyncForRemoval = UseCaseMarkTaskSyncForRemoval;
module.exports.UseCaseMarkTaskSyncDirty = UseCaseMarkTaskSyncDirty;
module.exports.UseCaseMarkTaskSyncsSynced = UseCaseMarkTaskSyncsSynced;
module.exports.UseCaseGetNonSyncedTaskSyncs = UseCaseGetNonSyncedTaskSyncs;
module.exports.UseCaseGetCompleteTaskSyncs = UseCaseGetCompleteTaskSyncs;
module.exports.UseCaseGetTaskSyncByTaskId = UseCaseGetTaskSyncByTaskId;