const { EventBus, EventType, Event } = require("../../../domain/shared/event-bus");
const { Logger } = require("../../../domain/shared/logger");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { TasksRPC } = require("../../../modules/tasks/rpc");
const { TaskServicesInstance } = require("../../../modules/tasks/services");
const { TASK_SYNCH_STATUS } = require("../../../modules/tasks_synch/data");
const { TasksSyncServicesInstance } = require("../../../modules/tasks_synch/services");
const { State, StateEffect } = require("../../../domain/modules/sync/domain");

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
        , taskServices
        , tasksSyncServices
        , tasksRPC) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            const remoteTasksResponse = await this.tasksRPC.listTasks(unitOfWork, authToken.accountId);

            const localTasks = await this.taskServices.list(unitOfWork, authToken.accountId);
            const notNewLocalTasks = [];
            // FIXME: This should be done the task sync service
            for (let task of localTasks) {
                const taskSync = await this.tasksSyncServices.getSyncStatus(unitOfWork, task.id);
                if (taskSync.status != TASK_SYNCH_STATUS["LOCAL"]) {
                    notNewLocalTasks.push(task);
                }
            }

            const tasksToDelete = notNewLocalTasks
                    .filter(entry => {
                        return remoteTasksResponse.data.tasks.filter(value => value.task_id == entry.id) == 0
                    })

            if (tasksToDelete.length > 0) {
                const tasksToDeleteIds = tasksToDelete.map((task) => task.id);
                await this.taskServices.deleteMultiple(unitOfWork, tasksToDeleteIds);
                await this.tasksSyncServices.deleteMultipleByTaskId(unitOfWork, tasksToDeleteIds);

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
        , taskServices
        , tasksSyncServices
        , tasksRPC) {

        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        console.log("Executing UpdateTasksLocalStateEffect");

        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);
            const remoteTasksResponse = await this.tasksRPC.listTasks(unitOfWork, authToken.accountId);
            remoteTasksResponse.data.tasks.map(entry => this.taskServices.update(
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
                , TaskServicesInstance
                , TasksSyncServicesInstance
                , TasksRPC));
    }
}

// Create Tasks Local

class CreateTasksLocalStateEffect extends StateEffect {

    constructor(unitOfWorkProvider = RunUnitOfWork, useCaseGetActiveSession, taskServices, tasksSyncServices, tasksRPC) {
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        console.log("Executing CreateTasksLocalStateEffect");

        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);

            const remoteTasksResponse = await this.tasksRPC.listTasks(unitOfWork, authToken.accountId);
            if (remoteTasksResponse.data.tasks.length > 0) {
                const existingTasks = await this.taskServices.list(unitOfWork, authToken.accountId);
                const tasksToInsert = remoteTasksResponse.data.tasks
                        .filter(result => existingTasks.filter(entry => entry.id == result.task_id).length == 0)
                        .map(taskData => ({
                            id: taskData.task_id
                            , title: taskData.title
                            , createdAt: new Date() // FIXME: This should come from the server
                            , updatedAt: new Date() // FIXME: This should come from the server
                            , ownerId: authToken.accountId
                        }));

                await this.taskServices.createMultiple(unitOfWork, tasksToInsert);
                await this.tasksSyncServices
                    .createMultipleSyncMonitor(unitOfWork, tasksToInsert.map(task => ({
                        taskId: task.id
                        , status: TASK_SYNCH_STATUS['SYNCHED']
                    })));
            }

            EventBus.publish(new Event(EventType.CREATED_LOCAL_TASKS, { accountId: authToken.accountId }));
        });
    }
}

class CreateTasksLocalState extends State {

    constructor(effect) {
        super(effect);
    }

    async next() {
        // FIXME: This State & StateAction should come from a provider
        return new UpdateTasksLocalState(
            new UpdateTasksLocalStateEffect(
                RunUnitOfWork
                , UseCaseGetActiveSessionProvider.get()
                , TaskServicesInstance
                , TasksSyncServicesInstance
                , TasksRPC));
    }
}

// Delete Tasks Remote

class DeleteTasksRemoteStateEffect extends StateEffect {

    constructor(unitOfWorkProvider = RunUnitOfWork, taskServices, tasksSyncServices, tasksRPC) {
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        console.log("Executing DeleteTasksRemoteStateEffect");

        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const locallyCompletedTasksSync = await this.tasksSyncServices.getComplete(unitOfWork);
            if (locallyCompletedTasksSync.length > 0) {
                const taskSyncsToDelete = [];
                for (const taskSync of locallyCompletedTasksSync) {
                    if (taskSync != undefined) {
                        try {
                            await this.tasksRPC.deleteTasks(unitOfWork, taskSync.taskId);
                            taskSyncsToDelete.push(taskSync);
                        } catch (e) {
                            if (e.response.status == StatusCode.NotFound) {
                                taskSyncsToDelete.push(taskSync);
                            } else {
                                Logger.error(e);
                            }
                        }
                    }
                }
                if (taskSyncsToDelete.length > 0) {
                    await this.tasksSyncServices.deleteMultipleByTaskId(unitOfWork, taskSyncsToDelete.map(taskSync => taskSync.taskId));
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
            new CreateTasksLocalStateEffect(
                RunUnitOfWork
                , UseCaseGetActiveSessionProvider.get()
                , TaskServicesInstance
                , TasksSyncServicesInstance
                , TasksRPC));
    }
}

// Update Tasks Remote State

class UpdateTasksRemoteStateEffect extends StateEffect {

    constructor(unitOfWorkProvider = RunUnitOfWork, taskServices, tasksSyncServices, tasksRPC) {
        super();

        this.unitOfWorkProvider = unitOfWorkProvider;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        console.log("Executing UpdateTasksRemoteStateEffect");

        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const unsyncedCreatedTaskSyncs = await this.tasksSyncServices.getNonSynced(unitOfWork)
            const locallyUpdatedTaskSyncs = unsyncedCreatedTaskSyncs
                .filter(task => task.synchStatus == TASK_SYNCH_STATUS.DIRTY);
            
                if (locallyUpdatedTaskSyncs.length > 0) {
                    const locallyUpdatedTasks = await this.taskServices.listById(unitOfWork, locallyUpdatedTaskSyncs.map(taskSync => taskSync.taskId));

                    const tasksRequest = locallyUpdatedTasks
                        .map(task => ({
                            task_id: task.id
                            , title: task.title
                            , description: task.description ? task.description : ""
                            , updated_at: task.updatedAt.toISOString()
                        }));

                    const result = await this.tasksRPC.updateTasks(unitOfWork, tasksRequest);
                    if (result != undefined) {
                        await this.tasksSyncServices.markSynced(unitOfWork, locallyUpdatedTaskSyncs.map(taskSync => taskSync.taskId));
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
                , TaskServicesInstance
                , TasksSyncServicesInstance
                , TasksRPC));
    }
}

// Create Tasks Remote State

class CreateTasksRemoteStateEffect extends StateEffect {

    constructor(
        unitOfWorkProvider = RunUnitOfWork
        , useCaseGetActiveSession
        , taskServices
        , tasksSyncServices
        , tasksRPC) {
        
        super();

        this.unitOfWorkProvider = unitOfWorkProvider
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.taskServices = taskServices;
        this.tasksSyncServices = tasksSyncServices;
        this.tasksRPC = tasksRPC;
    }

    async execute() {
        console.log("Executing CreateTasksRemoteStateEffect");

        await this.unitOfWorkProvider.run(async (unitOfWork) => {
            const authToken = await this.useCaseGetActiveSession.execute(unitOfWork);

            const unsyncedCreatedTaskSyncs = await this.tasksSyncServices.getNonSynced(unitOfWork)
            const locallyCreatedTaskSyncs = unsyncedCreatedTaskSyncs
                .filter(task => task.synchStatus == TASK_SYNCH_STATUS.LOCAL);

            if (locallyCreatedTaskSyncs.length > 0) {
                const locallyCreatedTasks = await this.taskServices.listById(unitOfWork, locallyCreatedTaskSyncs.map(task_sync => task_sync.taskId));
                const tasksRequest = locallyCreatedTasks
                    .map(task => ({
                            task_id: task.id
                            , title: task.title
                            , description: task.description ? task.description : ""
                            , created_at: task.createdAt.toISOString()
                            , updated_at: task.updatedAt.toISOString()
                            , owner_id: authToken.accountId
                        }));

                const result = await this.tasksRPC.createTasks(unitOfWork, tasksRequest);
                if (result != undefined && 'ids' in result && result.ids.length == tasksRequest.length) {
                    await this.tasksSyncServices.markSynced(unitOfWork, locallyCreatedTasks.map(task => task.id));
                } else if ('status' in result && result.status === '409') {
                    await this.tasksSyncServices.markSynced(unitOfWork, locallyCreatedTasks.map(task => task.id));
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
                , TaskServicesInstance
                , TasksSyncServicesInstance
                , TasksRPC));
    }
}

// Start Sync State

class StartSyncState extends State {

    constructor(
        unitOfWorkRunner = RunUnitOfWork
        , useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get()
        , tasksServicesProvider = () => TaskServicesInstance
        , tasksSyncServicesProvider = () => TasksSyncServicesInstance
        , tasksRPCProvider = () => TasksRPC) {

        super();

        this.unitOfWorkRunner = unitOfWorkRunner;
        this.useCaseGetActiveSession = useCaseGetActiveSession;
        this.tasksServicesProvider = tasksServicesProvider;
        this.tasksSyncServicesProvider = tasksSyncServicesProvider;
        this.tasksRPCProvider = tasksRPCProvider;
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
                        , this.tasksServicesProvider()
                        , this.tasksSyncServicesProvider()
                        , this.tasksRPCProvider()));
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