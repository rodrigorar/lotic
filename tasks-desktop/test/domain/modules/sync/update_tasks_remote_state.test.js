const { v4 } = require('uuid');
const { 
    UpdateTasksRemoteStateEffect
} = require('../../../../src/infrastructure/modules/sync/states');
const { AuthToken } = require('../../../../src/domain/modules/auth');
const { 
    TaskSync
    , Task
    , TASK_SYNC_STATUS 
} = require('../../../../src/domain/modules/tasks');

describe("[Sync]: Test Update Tasks Remote State Effect", () => {
    
    it("Should succeed update tasks remotelly", async () => {
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSync = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => unsyncedTasks);
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSync);

        const mockedMarkTasksSynced = jest.fn();
        mockedMarkTasksSynced.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ })
        
        const mockedUpdateTasksGateway = jest.fn();
        mockedUpdateTasksGateway.call = jest.fn((unitOfWork, request) => ({ status: 200 }));

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedMarkTasksSynced
            , mockedUpdateTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksByIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedUpdateTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to update remotelly", async () => {
        const unsyncedTaskSync = [];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        
        const mockedGetNonSyncedTasksUsecase = jest.fn();
        mockedGetNonSyncedTasksUsecase.execute = jest.fn((unitOfWork) => unsyncedTaskSync);

        const mockedMarkTasksSynced = jest.fn();
        mockedMarkTasksSynced.markSynced = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });
        
        const mockedUpdateTasksGateway = jest.fn();

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUsecase
            , mockedMarkTasksSynced
            , mockedUpdateTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUsecase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, get non synced tasks error", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => { throw new Error(); });

        const mockedMarkSyncedUseCase = jest.fn();
        
        const mockedUpdateTasksGateway = jest.fn();

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedMarkSyncedUseCase
            , mockedUpdateTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, list by id error", async () => {
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSync = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => { throw new Error(); });
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSync);

        const mockedMarkTasksSyncedUseCase = jest.fn();
        
        const mockedUpdateTasksGateway = jest.fn();

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedMarkTasksSyncedUseCase
            , mockedUpdateTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, remote call error", async () => {
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSync = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => unsyncedTasks);
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSync);

        const mockedMarkTasksSyncedUseCase = jest.fn();
        
        const mockedUpdateTasksGateway = jest.fn();
        mockedUpdateTasksGateway.call = jest.fn((unitOfWork, request) => { throw new Error(); })

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedMarkTasksSyncedUseCase
            , mockedUpdateTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, mark synced error", async () => {
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSync = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["DIRTY"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => unsyncedTasks);
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSync);

        const mockedMarkTasksSyncedUseCase = jest.fn();
        mockedMarkTasksSyncedUseCase.execute = jest.fn((unitOfWork, taskIds) => { throw new Error(); })
        
        const mockedUpdateTasksGateway = jest.fn();
        mockedUpdateTasksGateway.call = jest.fn((unitOfWork, request) => ({ status: 200 }));

        const underTest = new UpdateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedMarkTasksSyncedUseCase
            , mockedUpdateTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedTasksUseCase.execute.mock.calls).toHaveLength(1);
    });
});