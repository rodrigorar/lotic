const { v4 } = require('uuid');
const { TASK_SYNC_STATUS, TaskSync, UseCaseGetCompleteTaskSyncs } = require('../../../../../src/domain/modules/tasks/domain');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Get Complete Service", () => {
    
    it("Should succeed getting complete tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getComplete = jest.fn((unitOfWork) => {
            return [
                new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
                , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
                , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.COMPLETE, new Date(), new Date())
            ];
        });

        const underTest = new UseCaseGetCompleteTaskSyncs(mockedTasksSyncRepository);
        const result = await underTest.execute(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksSyncRepository.getComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getComplete = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const underTest = new UseCaseGetCompleteTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.getComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseGetCompleteTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});