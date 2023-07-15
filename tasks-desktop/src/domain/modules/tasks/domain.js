const { Validators } = require("../../shared/utils");
const { Command, Query } = require("../../shared/ports");

class Task {
    constructor(id, title, createdAt, updatedAt, ownerId) {
        this.id = id;
        this.title = title;
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

class UseCaseCreateTask extends Command {

    constructor(tasksRepository) {
        super();

        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data was provided!");

        const task = 
            new Task(
                taskData.id
                , taskData.title
                , taskData.createdAt
                , taskData.updatedAt
                , taskData.ownerId);
        await this.tasksRepository.save(unitOfWork, task);
    }
}

class UseCaseCreateTasks extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskDataList) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskDataList, "No tasks where provided");
    
        const tasks = taskDataList
            .map(taskData => 
                    new Task(
                        taskData.id
                        , taskData.title
                        , taskData.createdAt
                        , taskData.updatedAt
                        , taskData.ownerId));
        for (let task of tasks) {
            await this.tasksRepository.save(unitOfWork, task);
        }
    }
}

class UseCaseUpdateTask extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data provided");

        await this.tasksRepository.update(unitOfWork, taskData);
    }
}

class UseCaseUpdateTasks extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskDataList) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksData, "No task data list provided");

        for (let taskData of taskDataList) {
            await this.tasksRepository.updateTask(unitOfWork, taskData)
        }
    }
}

class UseCaseListTasksForAccount extends Query {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");
        
        return await this.tasksRepository.listByAccountId(unitOfWork, accountId);
    }
}

class UseCaseListTasksWithoutOwner extends Query {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksRepository.listWithoutOwner(unitOfWork);
    }
}

class UseCaseListTasksById extends Query {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskIdList = []) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksRepository.listById(unitOfWork, taskIdList);
    }
}

class UseCaseDeleteTask extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksRepository.erase(unitOfWork, taskId);
    }
}

class UseCaseDeleteTasks extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskIds = []) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        for (let taskId of taskIds) {
            await this.tasksRepository.erase(unitOfWork, taskId)
        }
    }
}

class UseCaseDeleteAllTasksForAccount extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        // TODO: This should use the standard Repository API and not a specific method
        this.tasksRepository.eraseAllForAccount(unitOfWork, accountId);
    }
}

class UseCaseUpdateTaskOwner extends Command {

    constructor(tasksRepository) {
        super();
        
        this.tasksRepository = tasksRepository;
    }

    async execute(unitOfWork, taskData) {
        this.tasksRepository.updateTaskOwner(unitOfWork, data);
    }
}

// Tasks Sync Use Cases
// FIXME: These use cases should coalesce with the use cases from the Tasks since
//  the Tasks entity is the aggregate root of this module. 

class UseCaseCreateTaskSync extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.taskSyncRepository.save(unitOfWork, taskId, TASK_SYNC_STATUS["LOCAL"]);
    }
}

class UseCaseCreateTaskSyncs extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, tasksSyncData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksSyncData, "No task sync data provided");

        for (let taskSyncData of tasksSyncData) {
            await this.taskSyncRepository.save(unitOfWork, taskSyncData.taskId, taskSyncData.status);
        }
    }
}

class UseCaseDeleteCompleteTaskSyncs extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        await this.taskSyncRepository.eraseComplete(unitOfWork);
    }
}

class UseCaseDeleteTaskSyncsByTaskIds extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskIds) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        await this.taskSyncRepository.eraseByTaskIds(unitOfWork, taskIds);
    }
}

class UseCaseDeleteAllTaskSyncsForAccount extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        await this.taskSyncRepository.eraseAllForAccount(unitOfWork, accountId);
    }
}

class UseCaseMarkTaskSyncForRemoval extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.tasksSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksSyncRepository.update(unitOfWork, { taskId: taskId, status: TASK_SYNC_STATUS["COMPLETE"] });
    }
}

class UseCaseMarkTaskSyncDirty extends Command {

    constructor(taskSyncRepository) {
        super();
        
        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.taskSyncRepository.markDirty(unitOfWork, taskId);
    }
}

class UseCaseMarkTaskSyncsSynced extends Command {

    constructor(taskSyncRepository) {
        super();

        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskIds) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskIds, "No task ids provided");

        const tasksSyncData = taskIds.map((id) => ({
            taskId: id
            , status: TASK_SYNC_STATUS["SYNCED"]
        }));
        await this.taskSyncRepository.updateMultiple(unitOfWork, tasksSyncData);
    }
}

class UseCaseGetNonSyncedTaskSyncs extends Query {

    constructor(taskSyncRepository) {
        super();

        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.taskSyncRepository.getLocalAndDirty(unitOfWork);
    }
}

class UseCaseGetCompleteTaskSyncs extends Query {

    constructor(taskSyncRepository) {
        super();

        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.taskSyncRepository.getComplete(unitOfWork);
    }   
}

class UseCaseGetTaskSyncByTaskId extends Query {

    constructor(taskSyncRepository) {
        super();

        this.taskSyncRepository = taskSyncRepository;
    }

    async execute(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        return await this.taskSyncRepository.get(unitOfWork, taskId);
    }
}

module.exports.Task = Task;
module.exports.TaskSync = TaskSync;
module.exports.TASK_SYNC_STATUS = TASK_SYNC_STATUS;

module.exports.UseCaseCreateTask = UseCaseCreateTask;
module.exports.UseCaseCreateTasks = UseCaseCreateTasks;
module.exports.UseCaseUpdateTask = UseCaseUpdateTask;
module.exports.UseCaseUpdateTasks = UseCaseUpdateTasks;
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