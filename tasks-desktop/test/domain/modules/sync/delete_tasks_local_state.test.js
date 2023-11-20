const { v4 } = require("uuid");
const { DeleteTasksLocalStateEffect } = require("../../../../src/infrastructure/modules/sync/states");
const { Task, TaskSync, TASK_SYNC_STATUS } = require("../../../../src/domain/modules/tasks");
const { AuthToken } = require("../../../../src/domain/modules/auth");

describe("[Sync]: Test Delete Tasks Local State Effect", () => {
    
    it("Should succeed delete local tasks", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], 0, TASK_SYNC_STATUS.COMPLETE, "Task #1", new Date(), new Date(), accountId)
            , new Task(task_ids[1], 1, TASK_SYNC_STATUS.COMPLETE, "Task #2", new Date(), new Date(), accountId)
        ];
        const localTasks = [
            new Task(task_ids[2], "Task #3", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[3], "Task #4", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[4], "Task #5", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()))

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => localTasks);

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: remoteTasks
            }
        }));
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(1);
        expect(mockedListByAccountIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedDeleteTasks.execute.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to delete locally", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], "Task #1", 0, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
            , new Task(task_ids[1], "Task #2", 1, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
        ];
        const localTasks = [];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()))

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => localTasks);

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: remoteTasks
            }
        }));
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(1);
        expect(mockedListByAccountIdUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail no active session error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], "Task #1", 0, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
            , new Task(task_ids[1], "Task #2", 1, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
        ];
        const localTasks = [
            new Task(task_ids[2], "Task #3", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[3], "Task #4", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[4], "Task #5", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => undefined)

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => localTasks);

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: remoteTasks
            }
        }));
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail remote call error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], "Task #1", 0, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
            , new Task(task_ids[1], "Task #2", 1, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
        ];
        const localTasks = [
            new Task(task_ids[2], "Task #3", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[3], "Task #4", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[4], "Task #5", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()))

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => localTasks);

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, list tasks by account id error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], "Task #1", 0, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
            , new Task(task_ids[1], "Task #2", 1, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
        ];
        const localTasks = [
            new Task(task_ids[2], "Task #3", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[3], "Task #4", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[4], "Task #5", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()))

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => { throw new Error(); });

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: remoteTasks
            }
        }));
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, delete multiple tasks error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const task_ids = [v4(), v4(), v4(), v4(), v4()];

        const remoteTasks = [
            new Task(task_ids[0], "Task #1", 0, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
            , new Task(task_ids[1], "Task #2", 1, TASK_SYNC_STATUS.COMPLETE, new Date(), new Date(), accountId)
        ];
        const localTasks = [
            new Task(task_ids[2], "Task #3", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[3], "Task #4", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(task_ids[4], "Task #5", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn(((work) => work(mockedUnitOfWork)));

        const mockedUseCaseGetActiveSessionUseCase = jest.fn();
        mockedUseCaseGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()))

        const mockedListByAccountIdUseCase = jest.fn();
        mockedListByAccountIdUseCase.execute = jest.fn((unitOfWork, accountId) => localTasks);

        const mockedDeleteTasks = jest.fn();
        mockedDeleteTasks.execute = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: remoteTasks
            }
        }));
        
        const underTest = new DeleteTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSessionUseCase
            , mockedListByAccountIdUseCase
            , mockedDeleteTasks
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });
});