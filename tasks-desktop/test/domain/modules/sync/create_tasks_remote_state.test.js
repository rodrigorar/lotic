const { v4 } = require('uuid');
const { 
    CreateTasksRemoteStateEffect
} = require('../../../../src/infrastructure/modules/sync/states');
const { AuthToken } = require('../../../../src/domain/modules/auth');
const { 
    TaskSync
    , Task
    , TASK_SYNC_STATUS 
} = require('../../../../src/domain/modules/tasks');

describe("[Sync]: Test Create Tasks Remote State Effect", () => {
    
    it("Should succeed create tasks remotelly", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));

        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });

        const mockedGetNonSyncedUseCase = jest.fn();
        mockedGetNonSyncedUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSyncs);

        const mockedMarkSyncedUseCase = jest.fn();
        mockedMarkSyncedUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });

        const mockedCreateTasksGateway = jest.fn();
        mockedCreateTasksGateway.call = jest.fn((unitOfWork, request) => ({
            status: 200
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedUseCase
            , mockedMarkSyncedUseCase
            , mockedCreateTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksByIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedCreateTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to create remotely", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTaskSyncs = [];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        
        const mockedListTasksByIdUseCase = jest.fn();

        const mockedMarkSyncedUseCase = jest.fn();
        
        const mockedGetNonSyncedUseCase = jest.fn();
        mockedGetNonSyncedUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        
        const mockedCreateTasksGateway = jest.fn();

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedUseCase
            , mockedMarkSyncedUseCase
            , mockedCreateTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should succeed remote error 409", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        
        const mockedAccountServices = jest.fn();
        
        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        
        const mockedGetNonSyncedUseCase = jest.fn();
        mockedGetNonSyncedUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSyncs);

        const mockedMarkSyncedUseCase = jest.fn();
        mockedMarkSyncedUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });
        
        const mockedCreateTasksGateway = jest.fn();
        mockedCreateTasksGateway.call = jest.fn((unitOfWork, request) => ({
            status: 409
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedUseCase
            , mockedMarkSyncedUseCase
            , mockedCreateTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksByIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedGetNonSyncedUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedMarkSyncedUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedCreateTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync services get non synced error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));

        const mockedListTasksByIdUseCase = jest.fn();
        
        const mockedGetNonSyncedUseCase = jest.fn();
        mockedGetNonSyncedUseCase.getNonSynced = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const mockedMarkSyncedUseCase = jest.fn();
        
        const mockedCreateTasksGateway = jest.fn();

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedUseCase
            , mockedMarkSyncedUseCase
            , mockedCreateTasksGateway);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync services mark synced error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        
        const mockedAccountServices = jest.fn();
        
        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        
        const mockedGetNonSyncedUseCase = jest.fn();
        mockedGetNonSyncedUseCase.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);

        const mockedMarkSyncedUseCase = jest.fn();
        mockedMarkSyncedUseCase.markSynced = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });
        
        const mockedCreateTasksGateway = jest.fn();
        mockedCreateTasksGateway.call = jest.fn((unitOfWork, request) => ({
            status: 200
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedAccountServices
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedUseCase
            , mockedMarkSyncedUseCase
            , mockedCreateTasksGateway);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, remote call error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", 0, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSync(v4(), unsyncedTasks[0].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[1].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSync(v4(), unsyncedTasks[2].id, TASK_SYNC_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        
        const mockedAccountServices = jest.fn();
        
        const mockedListTasksByIdUseCase = jest.fn();
        mockedListTasksByIdUseCase.exeucte = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        
        const mockedGetNonSyncedTasksUseCase = jest.fn();
        mockedGetNonSyncedTasksUseCase.execute = jest.fn((unitOfWork) => unsyncedTaskSyncs);

        const mockedMarkTasksSyncedUseCase = jest.fn();
        mockedMarkTasksSyncedUseCase.execute = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });
        
        const mockedCreateTasksGateway = jest.fn();
        mockedCreateTasksGateway.createTasks = jest.fn((unitOfWork, request) => {
            throw new Error();
        });

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedListTasksByIdUseCase
            , mockedGetNonSyncedTasksUseCase
            , mockedCreateTasksGateway);
        expect(underTest.execute()).rejects.toThrow();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });
});
