const { 
    UseCaseCreateTask
    , UseCaseCreateTasks
    , UseCaseUpdateTask 
    , UseCaseUpdateTasks
    , UseCaseGetTaskById
    , UseCaseListTasksForAccount
    , UseCaseListTasksWithoutOwner
    , UseCaseListTasksById
    , UseCaseDeleteTask
    , UseCaseDeleteTasks
    , UseCaseDeleteAllTasksForAccount
    , UseCaseUpdateTaskOwner
    , UseCaseMarkTaskSyncsSynced
    , UseCaseGetBySyncStatus
} = require("../../../domain/modules/tasks");
const { TasksRepository, TasksSyncRepository } = require("./repositories");

// Task Use Case Providers

const UseCaseCreateTaskProvider = (() => {
    const get = () => UseCaseCreateTask(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseCreateTasksProvider = (() => {
    const get = () => UseCaseCreateTasks(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseUpdateTaskProvider = (() => {
    const get = () => UseCaseUpdateTask(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseUpdateTasksProvider = (() => {
    const get = () => UseCaseUpdateTasks(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseGetTaskByIdProvider = (() => {
    const get = () => UseCaseGetTaskById(TasksRepository);
    return {
        get
    }
})();

const UseCaseGetBySyncStatusProvider = (() => {
    const get = () => UseCaseGetBySyncStatus(TasksRepository);
    return {
        get
    }
})();

const UseCaseListTasksForAccountProvider = (() => {
    const get = () => UseCaseListTasksForAccount(TasksRepository);
    return {
        get
    }
})();

const UseCaseListTasksWithoutOwnerProvider = (() => {
    const get = () => UseCaseListTasksWithoutOwner(TasksRepository);
    return {
        get
    }
})();

const UseCaseListTasksByIdProvider = (() => {
    const get = () => UseCaseListTasksById(TasksRepository);
    return {
        get
    }
})();

const UseCaseDeleteTaskProvider = (() => {
    const get = () => UseCaseDeleteTask(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseDeleteTasksProvider = (() => {
    const get = () => UseCaseDeleteTasks(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseDeleteAllTasksForAccountProvider = (() => {
    const get = () => UseCaseDeleteAllTasksForAccount(TasksRepository, TasksSyncRepository);
    return {
        get
    }
})();

const UseCaseUpdateTaskOwnerProvider = (() => {
    const get = () => UseCaseUpdateTaskOwner(TasksRepository);
    return {
        get
    }
})();

// Task Sync Use Case Providers

const UseCaseMarkTaskSyncsSyncedProvider = (() => {
    const get = () => UseCaseMarkTaskSyncsSynced(TasksSyncRepository);
    return {
        get
    }
})();

module.exports.UseCaseCreateTaskProvider = UseCaseCreateTaskProvider;
module.exports.UseCaseCreateTasksProvider = UseCaseCreateTasksProvider;
module.exports.UseCaseUpdateTaskProvider = UseCaseUpdateTaskProvider;
module.exports.UseCaseUpdateTasksProvider = UseCaseUpdateTasksProvider;
module.exports.UseCaseGetTaskByIdProvider = UseCaseGetTaskByIdProvider;
module.exports.UseCaseGetBySyncStatusProvider = UseCaseGetBySyncStatusProvider;
module.exports.UseCaseListTasksForAccountProvider = UseCaseListTasksForAccountProvider;
module.exports.UseCaseListTasksWithoutOwnerProvider = UseCaseListTasksWithoutOwnerProvider;
module.exports.UseCaseListTasksByIdProvider = UseCaseListTasksByIdProvider;
module.exports.UseCaseDeleteTaskProvider = UseCaseDeleteTaskProvider;
module.exports.UseCaseDeleteTasksProvider = UseCaseDeleteTasksProvider;
module.exports.UseCaseDeleteAllTasksForAccountProvider = UseCaseDeleteAllTasksForAccountProvider;
module.exports.UseCaseUpdateTaskOwnerProvider = UseCaseUpdateTaskOwnerProvider;

module.exports.UseCaseMarkTaskSyncsSyncedProvider = UseCaseMarkTaskSyncsSyncedProvider;