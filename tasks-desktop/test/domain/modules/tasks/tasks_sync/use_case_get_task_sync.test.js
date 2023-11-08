const { v4 } = require('uuid');
const { TASK_SYNC_STATUS, TaskSync, UseCaseGetTaskSyncByTaskId } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Get Sync Status Service", () => {
    
    it("Should succeed getting task sync status", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.get = jest.fn((unitOfWork, taskId) => {
            return new TaskSync(v4(), taskId, TASK_SYNC_STATUS.SYNCED, new Date(), new Date());
        });

        const underTest = new UseCaseGetTaskSyncByTaskId(mockedTasksSyncRepository);
        const result = await underTest.execute(unitOfWork, taskId);

        expect(result).toBeDefined();
        expect(result.taskId).toBe(taskId);

        expect(mockedTasksSyncRepository.get.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.get = jest.fn((unitOfWork, taskId) => {
            throw new Error();
        });

        const underTest = new UseCaseGetTaskSyncByTaskId(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.get.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseGetTaskSyncByTaskId(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseGetTaskSyncByTaskId(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});