const { UseCaseProvider } = require("../../../domain/shared/ports");
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
    , UseCaseCreateTaskSync
    , UseCaseCreateTaskSyncs
    , UseCaseDeleteCompleteTaskSyncs
    , UseCaseDeleteTaskSyncsByTaskIds
    , UseCaseDeleteAllTaskSyncsForAccount
    , UseCaseMarkTaskSyncForRemoval
    , UseCaseMarkTaskSyncDirty
    , UseCaseMarkTaskSyncsSynced
    , UseCaseGetNonSyncedTaskSyncs
    , UseCaseGetCompleteTaskSyncs
    , UseCaseGetTaskSyncByTaskId
} = require("../../../domain/modules/tasks/domain");
const { TasksRepositoryImpl, TasksSyncRepositoryImpl } = require("./adapters");

// Task Use Case Providers

class UseCaseCreateTaskProvider extends UseCaseProvider {

    get() {
        return new UseCaseCreateTask(new TasksRepositoryImpl());
    }
}

class UseCaseCreateTasksProvider extends UseCaseProvider {

    get() {
        return new UseCaseCreateTasks(new TasksRepositoryImpl());
    }
}

class UseCaseUpdateTaskProvider extends UseCaseProvider {

    get() {
        return new UseCaseUpdateTask(new TasksRepositoryImpl());
    }
}

class UseCaseUpdateTasksProvider extends UseCaseProvider {

    get() {
        return new UseCaseUpdateTasks(new TasksRepositoryImpl());
    }
}

class UseCaseGetTaskByIdProvider extends UseCaseProvider {
    get() {
        return new UseCaseGetTaskById(new TasksRepositoryImpl());
    }
}

class UseCaseListTasksForAccountProvider extends UseCaseProvider {
    get() {
        return new UseCaseListTasksForAccount(new TasksRepositoryImpl());
    }
} 

class UseCaseListTasksWithoutOwnerProvider extends UseCaseProvider {

    get() {
        return new UseCaseListTasksWithoutOwner(new TasksRepositoryImpl());
    }
}

class UseCaseListTasksByIdProvider extends UseCaseProvider {
    get() {
        return new UseCaseListTasksById(new TasksRepositoryImpl());
    }
}

class UseCaseDeleteTaskProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteTask(new TasksRepositoryImpl());
    }
}

class UseCaseDeleteTasksProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteTasks(new TasksRepositoryImpl());
    }
}

class UseCaseDeleteAllTasksForAccountProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteAllTasksForAccount(new TasksRepositoryImpl());
    }
}

class UseCaseUpdateTaskOwnerProvider extends UseCaseProvider {
    get() {
        return new UseCaseUpdateTaskOwner(new TasksRepositoryImpl());
    }
}

// Task Sync Use Case Providers

class UseCaseCreateTaskSyncProvider extends UseCaseProvider {
    get() {
        return new UseCaseCreateTaskSync(new TasksSyncRepositoryImpl());
    }
}

class UseCaseCreateTaskSyncsProvider extends UseCaseProvider {
    get() {
        return new UseCaseCreateTaskSyncs(new TasksSyncRepositoryImpl());
    }
}

class UseCaseDeleteCompleteTaskSyncsProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteCompleteTaskSyncs(new TasksSyncRepositoryImpl());
    }
}

class UseCaseDeleteTaskSyncsByTaskIdsProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteTaskSyncsByTaskIds(new TasksSyncRepositoryImpl());
    }
}

class UseCaseDeleteAllTaskSyncsForAccountProvider extends UseCaseProvider {
    get() {
        return new UseCaseDeleteAllTaskSyncsForAccount(new TasksSyncRepositoryImpl());
    }
}

class UseCaseMarkTaskSyncForRemovalProvider extends UseCaseProvider {
    get() {
        return new UseCaseMarkTaskSyncForRemoval(new TasksSyncRepositoryImpl());
    }
}

class UseCaseMarkTaskSyncDirtyProvider extends UseCaseProvider {
    get() {
        return new UseCaseMarkTaskSyncDirty(new TasksSyncRepositoryImpl());
    }
}

class UseCaseMarkTaskSyncsSyncedProvider extends UseCaseProvider {
    get() {
        return new UseCaseMarkTaskSyncsSynced(new TasksSyncRepositoryImpl());
    }
}

class UseCaseGetNonSyncedTaskSyncsProvider extends UseCaseProvider {
    get() {
        return new UseCaseGetNonSyncedTaskSyncs(new TasksSyncRepositoryImpl());
    }
}

class UseCaseGetCompleteTaskSyncsProvider extends UseCaseProvider {
    get() {
        return new UseCaseGetCompleteTaskSyncs(new TasksSyncRepositoryImpl());
    }
}

class UseCaseGetTaskSyncByTaskIdProvider extends UseCaseProvider {
    get() {
        return new UseCaseGetTaskSyncByTaskId(new TasksSyncRepositoryImpl());
    }
}

module.exports.UseCaseCreateTaskProvider = new UseCaseCreateTaskProvider();
module.exports.UseCaseCreateTasksProvider = new UseCaseCreateTasksProvider();
module.exports.UseCaseUpdateTaskProvider = new UseCaseUpdateTaskProvider();
module.exports.UseCaseUpdateTasksProvider = new UseCaseUpdateTasksProvider();
module.exports.UseCaseGetTaskByIdProvider = new UseCaseGetTaskByIdProvider();
module.exports.UseCaseListTasksForAccountProvider = new UseCaseListTasksForAccountProvider();
module.exports.UseCaseListTasksWithoutOwnerProvider = new UseCaseListTasksWithoutOwnerProvider();
module.exports.UseCaseListTasksByIdProvider = new UseCaseListTasksByIdProvider();
module.exports.UseCaseDeleteTaskProvider = new UseCaseDeleteTaskProvider();
module.exports.UseCaseDeleteTasksProvider = new UseCaseDeleteTasksProvider();
module.exports.UseCaseDeleteAllTasksForAccountProvider = new UseCaseDeleteAllTasksForAccountProvider();
module.exports.UseCaseUpdateTaskOwnerProvider = new UseCaseUpdateTaskOwnerProvider();

module.exports.UseCaseCreateTaskSyncProvider = new UseCaseCreateTaskSyncProvider();
module.exports.UseCaseCreateTaskSyncsProvider = new UseCaseCreateTaskSyncsProvider();
module.exports.UseCaseDeleteCompleteTaskSyncsProvider = new UseCaseDeleteCompleteTaskSyncsProvider();
module.exports.UseCaseDeleteTaskSyncsByTaskIdsProvider = new UseCaseDeleteTaskSyncsByTaskIdsProvider();
module.exports.UseCaseDeleteAllTaskSyncsForAccountProvider = new UseCaseDeleteAllTaskSyncsForAccountProvider();
module.exports.UseCaseMarkTaskSyncForRemovalProvider = new UseCaseMarkTaskSyncForRemovalProvider();
module.exports.UseCaseMarkTaskSyncDirtyProvider = new UseCaseMarkTaskSyncDirtyProvider();
module.exports.UseCaseMarkTaskSyncsSyncedProvider = new UseCaseMarkTaskSyncsSyncedProvider();
module.exports.UseCaseGetNonSyncedTaskSyncsProvider = new UseCaseGetNonSyncedTaskSyncsProvider();
module.exports.UseCaseGetCompleteTaskSyncsProvider = new UseCaseGetCompleteTaskSyncsProvider();
module.exports.UseCaseGetTaskSyncByTaskIdProvider = new UseCaseGetTaskSyncByTaskIdProvider();