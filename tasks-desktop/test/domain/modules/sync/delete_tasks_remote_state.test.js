const { v4 } = require("uuid");
const { NotImplementedError } = require("../../../../src/domain/errors");
const { TaskSync, TASK_SYNC_STATUS } = require("../../../../src/domain/modules/tasks");
const { DeleteTasksRemoteStateEffect } = require("../../../../src/infrastructure/modules/sync/states");

describe("[Sync]: Test Delete Tasks Remote State Effect", () => {
    
    it("Should succeed delete tasks remotelly", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const completeTaskSyncs = [
            new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
        ];
        const mockedGetCompleteTaskSyncsUseCase = jest.fn();
        mockedGetCompleteTaskSyncsUseCase.execute = jest.fn((unitOfWork) => completeTaskSyncs);

        const mockedDeleteTasksSyncByTaskIdUseCase = jest.fn();
        mockedDeleteTasksSyncByTaskIdUseCase.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedDeleteTasksGateway = jest.fn();
        mockedDeleteTasksGateway.call = jest.fn((unitOfWork, taskId) => { /* Do Nothing */ });

        const underTest = new DeleteTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetCompleteTaskSyncsUseCase
            , mockedDeleteTasksSyncByTaskIdUseCase
            , mockedDeleteTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetCompleteTaskSyncsUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedDeleteTasksSyncByTaskIdUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedDeleteTasksGateway.call.mock.calls).toHaveLength(3);
    });

    it("Should succeed no tasks to delete remotelly", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const completeTaskSyncs = [];
        const mockedGetCompleteTaskSyncsUseCase = jest.fn();
        mockedGetCompleteTaskSyncsUseCase.execute = jest.fn((unitOfWork) => completeTaskSyncs);

        const mockedDeleteTasksSyncByTaskIdUseCase = jest.fn();
        mockedDeleteTasksSyncByTaskIdUseCase.execute = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedDeleteTasksGateway = jest.fn();
        mockedDeleteTasksGateway.call = jest.fn((unitOfWork, taskId) => { /* Do Nothing */ });

        const underTest = new DeleteTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetCompleteTaskSyncsUseCase
            , mockedDeleteTasksSyncByTaskIdUseCase
            , mockedDeleteTasksGateway);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetCompleteTaskSyncsUseCase.execute.mock.calls).toHaveLength(1);
        expect(mockedDeleteTasksSyncByTaskIdUseCase.execute.mock.calls).toHaveLength(0);
        expect(mockedDeleteTasksGateway.call.mock.calls).toHaveLength(0);
    });

    it("Should fail, get complete error", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const mockedGetCompleteTaskSyncsUseCase = jest.fn();
        mockedGetCompleteTaskSyncsUseCase.execute = jest.fn((unitOfWork) => { throw new Error() });

        const mockedDeleteTasksSyncByTaskIdUseCase = jest.fn();
        const mockedDeleteTasksGateway = jest.fn();

        const underTest = new DeleteTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetCompleteTaskSyncsUseCase
            , mockedDeleteTasksSyncByTaskIdUseCase
            , mockedDeleteTasksGateway);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetCompleteTaskSyncsUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, remote call error", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const completeTaskSyncs = [
            new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
        ];
        const mockedGetCompleteTaskSyncsUseCase = jest.fn();
        mockedGetCompleteTaskSyncsUseCase.execute = jest.fn((unitOfWork) => completeTaskSyncs);

        const mockedDeleteTasksSyncByTaskIdUseCase = jest.fn();

        const mockedDeleteTasksGateway = jest.fn();
        mockedDeleteTasksGateway.call = jest.fn((unitOfWork, taskId) => { throw new Error(); });

        const underTest = new DeleteTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetCompleteTaskSyncsUseCase
            , mockedDeleteTasksSyncByTaskIdUseCase
            , mockedDeleteTasksGateway);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetCompleteTaskSyncsUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should fail, delete multiple by task id error", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        
        const completeTaskSyncs = [
            new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
        ];
        const mockedGetCompleteTaskSyncsUseCase = jest.fn();
        mockedGetCompleteTaskSyncsUseCase.execute = jest.fn((unitOfWork) => completeTaskSyncs);

        const mockedDeleteTasksSyncByTaskIdUseCase = jest.fn();
        mockedDeleteTasksSyncByTaskIdUseCase.execute = jest.fn((unitOfWork, taskIds) => { throw new Error(); });

        const mockedDeleteTasksGateway = jest.fn();
        mockedDeleteTasksGateway.call = jest.fn((unitOfWork, taskId) => { /* Do Nothing */ });

        const underTest = new DeleteTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedGetCompleteTaskSyncsUseCase
            , mockedDeleteTasksSyncByTaskIdUseCase
            , mockedDeleteTasksGateway);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedGetCompleteTaskSyncsUseCase.execute.mock.calls).toHaveLength(1);
    });
});