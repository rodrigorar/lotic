const { v4 } = require('uuid');
const { TASK_SYNC_STATUS, TaskSync, UseCaseGetNonSyncedTaskSyncs } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Get Non Synced Service", () => {
    
    it("Should succeed getting non synced tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getByState = jest.fn((unitOfWork) => {
            return [
                new TaskSync(v4(), v4(), TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
                , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.DIRTY, new Date(), new Date())
                , new TaskSync(v4(), v4(), TASK_SYNC_STATUS.LOCAL, new Date(), new Date())
            ];
        });

        const underTest = UseCaseGetNonSyncedTaskSyncs(mockedTasksSyncRepository);
        const result = await underTest.execute(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksSyncRepository.getByState.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getByState = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const underTest = UseCaseGetNonSyncedTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.getByState.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseGetNonSyncedTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});