const { EventBus, EventType, Event } = require("../../../domain/shared/event-bus");
const { Logger } = require("../../../domain/shared/logger");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { State, StateEffect } = require("../../../domain/modules/sync/domain");
const { TASK_SYNC_STATUS } = require("../../../domain/modules/tasks");
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
    , UseCaseGetBySyncStatusProvider
    , UseCaseMarkTaskSyncsSyncedProvider
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
        , listTasksGateway) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseListByAccountId = useCaseListByAccountId;
        this.useCaseDeleteTasks = useCaseDeleteTasks;
        this.listTasksGateway = listTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            if (authToken) {
                const remoteTasksResponse = await this.listTasksGateway.call(unitOfWork, authToken.accountId);

                const localTasks = await this.useCaseListByAccountId.execute(unitOfWork, authToken.accountId);
                const notNewLocalTasks = localTasks.filter(task => task.syncStatus != TASK_SYNC_STATUS.LOCAL);
                const tasksToDelete = notNewLocalTasks
                        .filter(entry => {
                            return remoteTasksResponse.data.tasks.filter(value => value.task_id == entry.id) == 0
                        })

                if (tasksToDelete.length > 0) {
                    const tasksToDeleteIds = tasksToDelete.map((task) => task.id);
                    await this.useCaseDeleteTasks.execute(unitOfWork, tasksToDeleteIds);

                    EventBus.publish(new Event(EventType.DELETED_LOCAL_TASKS, { accountId: authToken.accountId }));
                }
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
        , listTasksGateway
        , useCaseListTasksForAccountId) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseUpdateTask = useCaseUpdateTask;
        this.listTasksGateway = listTasksGateway;
        this.useCaseListTasksForAccountId = useCaseListTasksForAccountId; 
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            if (authToken) {
                const remoteTasksResponse = await this.listTasksGateway
                    .call(unitOfWork, authToken.accountId);
                let existingTasks = await this.useCaseListTasksForAccountId.execute(unitOfWork, authToken.accountId);
                existingTasks = existingTasks
                    .filter(task => task.syncStatus == TASK_SYNC_STATUS.DIRTY && task.syncStatus == TASK_SYNC_STATUS.COMPLETE)
                    .map(task => task.id);
                remoteTasksResponse.data.tasks.map(entry => {
                    if (! existingTasks.includes(entry.task_id)) {
                        this.useCaseUpdateTask.execute(
                            unitOfWork
                            , {
                                id: entry.task_id
                                , title: entry.title
                                , position: entry.position
                                , syncStatus: TASK_SYNC_STATUS.SYNCED
                                , createdAt: new Date() // FIXME: This should come from the server
                                , updatedAt: new Date() // FIXME: This should come from the server
                                , ownerId: entry.owner_id
                            }
                        );  
                    }
                })
            }
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
                , ListTasksGateway));
    }
}

// Create Tasks Local

class CreateTasksLocalStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseListTasksForAccountId
        , useCaseCreateTasks
        , listTasksGateway) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseListTasksForAccountId = useCaseListTasksForAccountId; 
        this.useCaseCreateTasks = useCaseCreateTasks;
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
                            , position: taskData.position ? taskData.position : undefined
                            , syncStatus: TASK_SYNC_STATUS.SYNCED
                            , createdAt: new Date() // FIXME: This should come from the server
                            , updatedAt: new Date() // FIXME: This should come from the server
                            , ownerId: authToken.accountId
                        }));

                await this.useCaseCreateTasks.execute(unitOfWork, tasksToInsert);
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
                    , ListTasksGateway
                    , UseCaseListTasksForAccountProvider.get()));
        });
    }
}

// Delete Tasks Remote

class DeleteTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useGetTaskBySyncStatus
        , useCaseDeleteTasks
        , deleteTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useGetTaskBySyncStatus = useGetTaskBySyncStatus;
        this.useCaseDeleteTasks = useCaseDeleteTasks;
        this.deleteTasksGateway = deleteTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const locallyCompletedTasks = await this.useGetTaskBySyncStatus.execute(
                unitOfWork
                , [TASK_SYNC_STATUS.COMPLETE]
            );
            
            if (locallyCompletedTasks.length > 0) {
                const tasksToDelete = [];
                for (const task of locallyCompletedTasks) {
                    if (task != undefined) {
                        try {
                            // FIXME: The server should receive a list of tasks instead of only one
                            await this.deleteTasksGateway.call(unitOfWork, task.id);
                            tasksToDelete.push(task.id);
                        } catch (e) {
                            if (e.response != undefined && e.response.status == StatusCode.NotFound) {
                                tasksToDelete.push(task.id);
                            } else {
                                Logger.error(e);
                                throw e;
                            }
                        }
                    }
                }
                if (tasksToDelete.length > 0) {
                    await this.useCaseDeleteTasks.execute(unitOfWork, tasksToDelete);
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
                , ListTasksGateway));
    }
}

// Update Tasks Remote State

class UpdateTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetBySyncStatus
        , useCaseMarkTaskSyncAsSynced
        , updateTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetBySyncStatus = useCaseGetBySyncStatus;
        this.useCaseMarkTaskSyncAsSynced = useCaseMarkTaskSyncAsSynced;
        this.updateTasksGateway = updateTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const locallyUpdatedTasks = await this.useCaseGetBySyncStatus.execute(
                unitOfWork
                , [TASK_SYNC_STATUS.DIRTY]
            );
            if (locallyUpdatedTasks.length > 0) {
                const tasksRequest = locallyUpdatedTasks
                    .map(task => ({
                        task_id: task.id
                        , title: task.title
                        , description: task.description ? task.description : ""
                        , position: task.position
                        , updated_at: task.updatedAt.toISOString()
                    }));

                const result = await this.updateTasksGateway.call(unitOfWork, tasksRequest);
                if (result != undefined) {
                    await this.useCaseMarkTaskSyncAsSynced.execute(unitOfWork, locallyUpdatedTasks.map(task => task.id));
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
                , UseCaseGetBySyncStatusProvider.get()
                , UseCaseDeleteTasksProvider.get()
                , DeleteTasksGateway));
    }
}

// Create Tasks Remote State

class CreateTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , useCaseGetBySyncStatus
        , useCaseMarkTaskSyncSynced
        , createTasksGateway) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.useCaseGetBySyncStatus = useCaseGetBySyncStatus;
        this.useCaseMarkTaskSyncSynced = useCaseMarkTaskSyncSynced;
        this.createTasksGateway = createTasksGateway;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);

            const locallyCreatedTasks = await this.useCaseGetBySyncStatus.execute(
                unitOfWork
                , [TASK_SYNC_STATUS.LOCAL]
            );
            if (locallyCreatedTasks.length > 0) {
                const tasksRequest = locallyCreatedTasks
                    .map(task => ({
                            task_id: task.id
                            , title: task.title
                            , description: task.description ? task.description : ""
                            , position: task.position
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
                , UseCaseGetBySyncStatusProvider.get()
                , UseCaseMarkTaskSyncsSyncedProvider.get()
                , UpdateTasksGateway));
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
                result = new CreateTasksRemoteState(
                    new CreateTasksRemoteStateEffect(
                        this.unitOfWorkRunner
                        , UseCaseGetActiveSessionProvider.get()
                        , UseCaseGetBySyncStatusProvider.get()
                        , UseCaseMarkTaskSyncsSyncedProvider.get()
                        , CreateTasksGateway));
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