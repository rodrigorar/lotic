const { v4 } = require('uuid');
const { UseCaseDeleteTaskSyncsByTaskIds } = require('../../../../../src/domain/modules/tasks');

describe("[Tasks Sync]: Test Multiple by Task Id Service", () => {
    
    it("Should succeed deleting multiple by task id", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.eraseByTaskIds = jest.fn((unitOfWork, taskIds) => {
            // Do Nothing
        });

        const underTest = UseCaseDeleteTaskSyncsByTaskIds(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.eraseByTaskIds = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = UseCaseDeleteTaskSyncsByTaskIds(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskIds)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskIds = [v4(), v4(), v4()];
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseDeleteTaskSyncsByTaskIds(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskIds)).rejects.toThrow(Error);
    });

    it("Should fail, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseDeleteTaskSyncsByTaskIds(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Error);
    });
});