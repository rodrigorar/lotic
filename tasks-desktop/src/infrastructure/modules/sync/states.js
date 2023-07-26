const { EventBus, EventType, Event } = require("../../../domain/shared/event-bus");
const { Logger } = require("../../../domain/shared/logger");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { State, StateEffect } = require("../../../domain/modules/sync/domain");
const { TASK_SYNC_STATUS } = require("../../../domain/modules/tasks/domain");
const { 
    ListTasksGateway
    , DeleteTasksGateway
    , UpdateTasksGateway
    , CreateTasksGateway
} = require("../tasks/gateways");
const { 
    UseCaseListTasksForAccountProvider
    , UseCaseDeleteTasksProvider
    , UseCaseUpdateTaskProvider
    , UseCaseCreateTasksProvider
    , UseCaseListTasksByIdProvider
    , UseCaseGetTaskSyncByTaskIdProvider
    , UseCaseDeleteTaskSyncsByTaskIdsProvider,
    UseCaseCreateTaskSyncsProvider,
    UseCaseGetCompleteTaskSyncsProvider,
    UseCaseGetNonSyncedTaskSyncsProvider,
    UseCaseMarkTaskSyncsSyncedProvider
} = require("../tasks/providers");

// Sync Done

class SyncDoneState extends State {

    constructor() {
        super();
    }

    async next() {
        return undefined;
    }
}

// Delete Tasks Local

class DeleteTasksLocalStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseListByAccountId
        , useCaseDeleteTasks
        , useCaseGetTaskSyncByTaskId
        , useCaseDeleteTaskSyncsByTaskIds
        , listTasksGateway) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseListByAccountId = useCaseListByAccountId;
        this.useCaseDeleteTasks = useCaseDeleteTasks;
        this.useCaseGetTaskSyncByTaskId = useCaseGetTaskSyncByTaskId;
        this.useCaseDeleteTaskSyncsByTaskIds = useCaseDeleteTaskSyncsByTaskIds;
        this.listTasksGateway = listTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            const remoteTasksResponse = await this.listTasksGateway.call(unitOfWork, authToken.accountId);

            const localTasks = await this.useCaseListByAccountId.execute(unitOfWork, authToken.accountId);
            const notNewLocalTasks = [];
            // FIXME: This should be done the task sync service
            for (let task of localTasks) {
                const taskSync = await this.useCaseGetTaskSyncByTaskId.execute(unitOfWork, task.id);
                if (taskSync.status != TASK_SYNC_STATUS.LOCAL) {
                    notNewLocalTasks.push(task);
                }
            }

            const tasksToDelete = notNewLocalTasks
                    .filter(entry => {
                        return remoteTasksResponse.data.tasks.filter(value => value.task_id == entry.id) == 0
                    })

            if (tasksToDelete.length > 0) {
                const tasksToDeleteIds = tasksToDelete.map((task) => task.id);
                await this.useCaseDeleteTasks.execute(unitOfWork, tasksToDeleteIds);
                await this.useCaseDeleteTaskSyncsByTaskIds.execute(unitOfWork, tasksToDeleteIds);

                EventBus.publish(new Event(EventType.DELETED_LOCAL_TASKS, { accountId: authToken.accountId }));
            }
        });
    }
}

class DeleteTasksLocalState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        return new SyncDoneState();
    }
}

// Update Tasks Local

class UpdateTasksLocalStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseUpdateTask
        , listTasksGateway) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseUpdateTask = useCaseUpdateTask;
        this.listTasksGateway = listTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            const remoteTasksResponse = await this.listTasksGateway.call(unitOfWork, authToken.accountId);
            remoteTasksResponse.data.tasks.map(entry => this.useCaseUpdateTask.execute(
                unitOfWork
                , {
                    id: entry.task_id
                    , title: entry.title
                    , createdAt: new Date() // FIXME: This should come from the server
                    , updatedAt: new Date() // FIXME: This should come from the server
                    , ownerId: entry.owner_id
                }))
        });
    }
}

class UpdateTasksLocalState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        // FIXME: This State & StateAction should come from a provider
        return new DeleteTasksLocalState(
            new DeleteTasksLocalStateEffect(
                RunUnitOfWork
                , UseCaseGetActiveSessionProvider.get()
                , UseCaseListTasksForAccountProvider.get()
                , UseCaseDeleteTasksProvider.get()
                , UseCaseGetTaskSyncByTaskIdProvider.get()
                , UseCaseDeleteTaskSyncsByTaskIdsProvider.get()
                , new ListTasksGateway()));
    }
}

// Create Tasks Local

class CreateTasksLocalStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseListTasksForAccountId
        , useCaseCreateTasks
        , useCaseCreateTaskSyncs
        , listTasksGateway) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseListTasksForAccountId = useCaseListTasksForAccountId; 
        this.useCaseCreateTasks = useCaseCreateTasks;
        this.useCaseCreateTaskSyncs = useCaseCreateTaskSyncs;
        this.listTasksGateway = listTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            if (! authToken) {
                return;
            }

            const remoteTasksResponse = await this.listTasksGateway.call(unitOfWork, authToken.accountId);
            if (remoteTasksResponse.data.tasks.length > 0) {
                const existingTasks = await this.useCaseListTasksForAccountId.execute(unitOfWork, authToken.accountId);
                const tasksToInsert = remoteTasksResponse.data.tasks
                        .filter(result => existingTasks.filter(entry => entry.id == result.task_id).length == 0)
                        .map(taskData => ({
                            id: taskData.task_id
                            , title: taskData.title
                            , createdAt: new Date() // FIXME: This should come from the server
                            , updatedAt: new Date() // FIXME: This should come from the server
                            , ownerId: authToken.accountId
                        }));

                await this.useCaseCreateTasks.execute(unitOfWork, tasksToInsert);
                await this.useCaseCreateTaskSyncs
                    .execute(unitOfWork, tasksToInsert.map(task => ({
                        taskId: task.id
                        , status: TASK_SYNC_STATUS['SYNCED']
                    })));
            }

            EventBus.publish(new Event(EventType.CREATED_LOCAL_TASKS, { accountId: authToken.accountId }));
        });
    }
}

class CreateTasksLocalState extends State {

    constructor(unitOfWorkProvider, useCaseGetActiveSession, effect) {
        super(effect);

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
    }

    async next() {
        return await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            if (! authToken) {
                return SyncDoneState();
            }
            return new UpdateTasksLocalState(
                new UpdateTasksLocalStateEffect(
                    RunUnitOfWork
                    , UseCaseGetActiveSessionProvider.get()
                    , UseCaseUpdateTaskProvider.get()
                    , new ListTasksGateway()));
        });
    }
}

// Delete Tasks Remote

class DeleteTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetCompleteTaskSyncs
        , useCaseDeleteTaskSyncsByTaskId
        , deleteTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetCompleteTaskSyncs = useCaseGetCompleteTaskSyncs;
        this.useCaseDeleteTaskSyncsByTaskId = useCaseDeleteTaskSyncsByTaskId;
        this.deleteTasksGateway = deleteTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const locallyCompletedTasksSync = await this.useCaseGetCompleteTaskSyncs.execute(unitOfWork);
            if (locallyCompletedTasksSync.length > 0) {
                const taskSyncsToDelete = [];
                for (const taskSync of locallyCompletedTasksSync) {
                    if (taskSync != undefined) {
                        try {
                            // FIXME: The server should receive a list of tasks instead of only one
                            await this.deleteTasksGateway.call(unitOfWork, taskSync.taskId);
                            taskSyncsToDelete.push(taskSync);
                        } catch (e) {
                            if (e.response != undefined && e.response.status == StatusCode.NotFound) {
                                taskSyncsToDelete.push(taskSync);
                            } else {
                                Logger.error(e);
                                throw e;
                            }
                        }
                    }
                }
                if (taskSyncsToDelete.length > 0) {
                    await this.useCaseDeleteTaskSyncsByTaskId.execute(unitOfWork, taskSyncsToDelete.map(taskSync => taskSync.taskId));
                }
            }
        });
    }
}

class DeleteTasksRemoteState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        // FIXME: This State & StateAction should come from a provider
        return new CreateTasksLocalState(
            RunUnitOfWork
            , UseCaseGetActiveSessionProvider.get()
            , new CreateTasksLocalStateEffect(
                RunUnitOfWork
                , UseCaseGetActiveSessionProvider.get()
                , UseCaseListTasksForAccountProvider.get()
                , UseCaseCreateTasksProvider.get()
                , UseCaseCreateTaskSyncsProvider.get()
                , new ListTasksGateway()));
    }
}

// Update Tasks Remote State

// HERE

class UpdateTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseListTasksById
        , useCaseGetNonSyncedTasksSync
        , useCaseMarkTaskSyncAsSynced
        , updateTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseListTasksById = useCaseListTasksById;
        this.useCaseGetNonSyncedTasksSync = useCaseGetNonSyncedTasksSync;
        this.useCaseMarkTaskSyncAsSynced = useCaseMarkTaskSyncAsSynced;
        this.updateTasksGateway = updateTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const unsyncedCreatedTaskSyncs = await this.useCaseGetNonSyncedTasksSync.execute(unitOfWork)
            const locallyUpdatedTaskSyncs = unsyncedCreatedTaskSyncs
                .filter(task => task.status == TASK_SYNC_STATUS.DIRTY);
            
                if (locallyUpdatedTaskSyncs.length > 0) {
                    const locallyUpdatedTasks = await this.useCaseListTasksById.execute(unitOfWork, locallyUpdatedTaskSyncs.map(taskSync => taskSync.taskId));

                    const tasksRequest = locallyUpdatedTasks
                        .map(task => ({
                            task_id: task.id
                            , title: task.title
                            , description: task.description ? task.description : ""
                            , updated_at: task.updatedAt.toISOString()
                        }));

                    const result = await this.updateTasksGateway.call(unitOfWork, tasksRequest);
                    if (result != undefined) {
                        await this.useCaseMarkTaskSyncAsSynced.execute(unitOfWork, locallyUpdatedTaskSyncs.map(taskSync => taskSync.taskId));
                    }
                }
        });
    }
}

class UpdateTasksRemoteState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        // FIXME: This State & StateAction should come from a provider
        return new DeleteTasksRemoteState(
            new DeleteTasksRemoteStateEffect(
                RunUnitOfWork
                , UseCaseGetCompleteTaskSyncsProvider.get()
                , UseCaseDeleteTaskSyncsByTaskIdsProvider.get()
                , new DeleteTasksGateway()));
    }
}

// Create Tasks Remote State

class CreateTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseListTasksById
        , useCaseGetNonSyncedTaskSyncs
        , useCaseMarkTaskSyncSynced
        , createTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseListTasksById = useCaseListTasksById;
        this.useCaseGetNonSyncedTaskSyncs = useCaseGetNonSyncedTaskSyncs;
        this.useCaseMarkTaskSyncSynced = useCaseMarkTaskSyncSynced;
        this.createTasksGateway = createTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);

            const unsyncedCreatedTaskSyncs = await this.useCaseGetNonSyncedTaskSyncs.execute(unitOfWork);
            const locallyCreatedTaskSyncs = unsyncedCreatedTaskSyncs
                .filter(task => task.status == TASK_SYNC_STATUS["LOCAL"]);

            if (locallyCreatedTaskSyncs.length > 0) {
                const locallyCreatedTasks = await this.useCaseListTasksById.execute(unitOfWork, locallyCreatedTaskSyncs.map(task_sync => task_sync.taskId));
                const tasksRequest = locallyCreatedTasks
                    .map(task => ({
                            task_id: task.id
                            , title: task.title
                            , description: task.description ? task.description : ""
                            , created_at: task.createdAt.toISOString()
                            , updated_at: task.updatedAt.toISOString()
                            , owner_id: authToken.accountId
                        }));

                const result = await this.createTasksGateway.call(unitOfWork, tasksRequest);
                if (result != undefined && 'ids' in result && result.ids.length == tasksRequest.length) {
                    await this.useCaseMarkTaskSyncSynced.execute(unitOfWork, locallyCreatedTasks.map(task => task.id));
                } else if ('status' in result && result.status === '409') {
                    await this.useCaseMarkTaskSyncSynced.execute(unitOfWork, locallyCreatedTasks.map(task => task.id));
                }
            }
        });
    }
}

class CreateTasksRemoteState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        // FIXME: This State & StateAction should come from a provider
        return new UpdateTasksRemoteState(
            new UpdateTasksRemoteStateEffect(
                RunUnitOfWork
                , UseCaseListTasksByIdProvider.get()
                , UseCaseGetNonSyncedTaskSyncsProvider.get()
                , UseCaseMarkTaskSyncsSyncedProvider.get()
                , new UpdateTasksGateway()));
    }
}

// Start Sync State

class StartSyncState extends State {

    constructor(
        unitOfWorkRunner = RunUnitOfWork
        , useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get()) {

        super();

        this.unitOfWorkRunner = unitOfWorkRunner;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
    }

    async next() {
        return await this.unitOfWorkRunner.run(async (unitOfWork) => {
            const authSession = await this.useCaseGetActiveSession.execute(unitOfWork);

            let result = undefined;
            if (authSession) {
                // FIXME: This State & StateAction should come from a provider
                result = new CreateTasksRemoteState(
                    new CreateTasksRemoteStateEffect(
                        this.unitOfWorkRunner
                        , UseCaseGetActiveSessionProvider.get()
                        , UseCaseListTasksByIdProvider.get()
                        , UseCaseGetNonSyncedTaskSyncsProvider.get()
                        , UseCaseMarkTaskSyncsSyncedProvider.get()
                        , new CreateTasksGateway()));
            } else {
                Logger.info("No account logged in, next state is SyncDoneState");
                result = new SyncDoneState()
            }

            return result;
        });
    }
}

module.exports.StartSyncState = StartSyncState;
module.exports.CreateTasksRemoteState = CreateTasksRemoteState;
module.exports.CreateTasksRemoteStateEffect = CreateTasksRemoteStateEffect;
module.exports.UpdateTasksRemoteState = UpdateTasksRemoteState;
module.exports.UpdateTasksRemoteStateEffect = UpdateTasksRemoteStateEffect;
module.exports.DeleteTasksRemoteState = DeleteTasksRemoteState;
module.exports.DeleteTasksRemoteStateEffect = DeleteTasksRemoteStateEffect;
module.exports.CreateTasksLocalState = CreateTasksLocalState;
module.exports.CreateTasksLocalStateEffect = CreateTasksLocalStateEffect;
module.exports.UpdateTasksLocalState = UpdateTasksLocalState;
module.exports.UpdateTasksLocalStateEffect = UpdateTasksLocalStateEffect;
module.exports.DeleteTasksLocalState = DeleteTasksLocalState;
module.exports.DeleteTasksLocalStateEffect = DeleteTasksLocalStateEffect;
module.exports.SyncDoneState = SyncDoneState;