const { v4 } = require("uuid");
const { Task, TASK_SYNC_STATUS } = require("../../../../src/domain/modules/tasks");
const { UpdateTasksLocalStateEffect } = require("../../../../src/infrastructure/modules/sync/states");
const { AuthToken } = require("../../../../src/domain/modules/auth");

describe("[Sync]: Test Update Tasks Local State Effect", () => {
    
    it("Should succeed to update tasks locally", async () => {
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());
        const mockedUseCaseGetActiveSession = jest.fn();
        mockedUseCaseGetActiveSession.execute = jest.fn((unitOfWork) => authSession);

        const mockedUpdateTaskUseCase = jest.fn();
        mockedUpdateTaskUseCase.execute = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedListTasksByAccountIdUseCase = jest.fn();
        mockedListTasksByAccountIdUseCase.execute = jest.fn(((unitOfWork, accountId) => []));

        const taskList = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
        ];
        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: taskList
            }
        }));

        const underTest = new UpdateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSession
            , mockedUpdateTaskUseCase
            , mockedListTasksGateway
            , mockedListTasksByAccountIdUseCase)
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSession.execute.mock.calls).toHaveLength(1);
        expect(mockedUpdateTaskUseCase.execute.mock.calls).toHaveLength(3);
        expect(mockedListTasksByAccountIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to update locally", async () => {
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());
        const mockedUseCaseGetActiveSession = jest.fn();
        mockedUseCaseGetActiveSession.execute = jest.fn((unitOfWork) => authSession);

        const mockedUpdateTaskUseCase = jest.fn();
        mockedUpdateTaskUseCase.execute = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedListTasksByAccountIdUseCase = jest.fn();
        mockedListTasksByAccountIdUseCase.execute = jest.fn(((unitOfWork, accountId) => []));

        const taskList = [];
        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: taskList
            }
        }));

        const underTest = new UpdateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSession
            , mockedUpdateTaskUseCase
            , mockedListTasksGateway
            , mockedListTasksByAccountIdUseCase)
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSession.execute.mock.calls).toHaveLength(1);
        expect(mockedListTasksByAccountIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedUpdateTaskUseCase.execute.mock.calls).toHaveLength(0);
    });

    it("Should fail, no active session error", async () => {
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const mockedUseCaseGetActiveSession = jest.fn();
        mockedUseCaseGetActiveSession.execute = jest.fn((unitOfWork) => undefined);

        const mockedUpdateTaskUseCase = jest.fn();
        mockedUpdateTaskUseCase.execute = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedListTasksByAccountIdUseCase = jest.fn();
        mockedListTasksByAccountIdUseCase.execute = jest.fn(((unitOfWork, accountId) => []));

        const taskList = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: taskList
            }
        }));

        const underTest = new UpdateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSession
            , mockedUpdateTaskUseCase
            , mockedListTasksGateway
            , mockedListTasksByAccountIdUseCase)
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSession.execute.mock.calls).toHaveLength(1);
        expect(mockedUpdateTaskUseCase.execute.mock.calls).toHaveLength(0);
        expect(mockedListTasksByAccountIdUseCase.execute.mock.calls).toHaveLength(0);
        expect(mockedListTasksGateway.call.mock.calls).toHaveLength(0);
    });

    it("Should fail, remote call error", async () => {
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());
        const mockedUseCaseGetActiveSession = jest.fn();
        mockedUseCaseGetActiveSession.execute = jest.fn((unitOfWork) => authSession);

        const mockedUpdateTaskUseCase = jest.fn();
        mockedUpdateTaskUseCase.execute = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedListTasksByAccountIdUseCase = jest.fn();
        mockedListTasksByAccountIdUseCase.execute = jest.fn(((unitOfWork, accountId) => []));

        const taskList = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = new UpdateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSession
            , mockedUpdateTaskUseCase
            , mockedListTasksGateway
            , mockedListTasksByAccountIdUseCase)
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSession.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, update tasks service error", async () => {
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));

        const authSession = new AuthToken(v4(), v4(), accountId, new Date());
        const mockedUseCaseGetActiveSession = jest.fn();
        mockedUseCaseGetActiveSession.execute = jest.fn((unitOfWork) => authSession);

        const mockedUpdateTaskUseCase = jest.fn();
        mockedUpdateTaskUseCase.execute = jest.fn((unitOfWork, task) => { 
            throw new Error();
        });

        const mockedListTasksByAccountIdUseCase = jest.fn();
        mockedListTasksByAccountIdUseCase.execute = jest.fn(((unitOfWork, accountId) => []));

        const taskList = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
        ];
        const mockedListTasksGateway = jest.fn();
        mockedListTasksGateway.call = jest.fn((unitOfWork, accountId) => ({
            data: {
                tasks: taskList
            }
        }));

        const underTest = new UpdateTasksLocalStateEffect(
            mockedUnitOfWorkProvider
            , mockedUseCaseGetActiveSession
            , mockedUpdateTaskUseCase
            , mockedListTasksGateway
            , mockedListTasksByAccountIdUseCase)
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedUseCaseGetActiveSession.execute.mock.calls).toHaveLength(1);
    });
});