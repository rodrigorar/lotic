const { v4 } = require("uuid");
const { AuthToken } = require("../../../../src/domain/modules/auth");
const { Task, TASK_SYNC_STATUS } = require("../../../../src/domain/modules/tasks");
const { NotImplementedError } = require("../../../../src/domain/errors");
const { CreateTasksLocalStateEffect } = require("../../../../src/infrastructure/modules/sync/states");

describe("[Sync]: Test Create Tasks Local State Effect", () => {
    
    it("Should succeed create local tasks", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, v4(), accessToken, new Date()));

        const existingTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.LOCAL,  new Date(), new Date(), accountId)
        ];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => existingTasks);

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: existingTasks
            }
        }));

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedUseCaseListTasksForAccountId.execute.mock.calls).toHaveLength(1);
        expect(mockedCreateTasksUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to create locally", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, v4(), accessToken, new Date()));

        const existingTasks = [];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => existingTasks);

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: existingTasks
            }
        }));

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should fail, no active session error", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => null);

        const existingTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
        ];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => existingTasks);

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: existingTasks
            }
        }));

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    })

    it("Should fail, remote call error", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, v4(), accessToken, new Date()));

        const existingTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3",  1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
        ];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => existingTasks);

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => { throw new Error(); });

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, list service error", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, v4(), accessToken, new Date()));

        const existingTasks = [
            new Task(v4(), "Task #1",  0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.LOCAL,  new Date(), new Date(), accountId)
        ];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => { throw new Error(); });

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { /* Do Nothing */ });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: existingTasks
            }
        }));

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, create multiple tasks error", async () => {
        const accountId = v4();
        const accessToken = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn((unitOfWork) => new AuthToken(accessToken, v4(), accessToken, new Date()));

        const existingTasks = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.LOCAL,  new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.LOCAL,  new Date(), new Date(), accountId)
        ];

        const mockedUseCaseListTasksForAccountId = jest.fn();
        mockedUseCaseListTasksForAccountId.execute = jest.fn((unitOfWork, accountId) => existingTasks);

        const mockedCreateTasksUseCase = jest.fn();
        mockedCreateTasksUseCase.execute = jest.fn((unitOfWork, tasks) => { throw new Error(); });

        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: existingTasks
            }
        }));

        const underTest = new CreateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetActiveSessionUseCase
            , mockedUseCaseListTasksForAccountId
            , mockedCreateTasksUseCase
            , mockedListTasksGateway);
        await expect(async () => await underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });
});