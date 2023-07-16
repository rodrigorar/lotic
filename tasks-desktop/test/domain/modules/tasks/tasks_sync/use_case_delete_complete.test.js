const { UseCaseDeleteCompleteTaskSyncs } = require('../../../../../src/domain/modules/tasks/domain');

describe("[Tasks Sync]: Test Delete Complete Service", () => {

    it("Should succeed deleting complete task syncs", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.eraseComplete = jest.fn((unitOfWork) => { /* Do Nothing */ });

        const underTest = new UseCaseDeleteCompleteTaskSyncs(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork);

        expect(mockedTasksSyncRepository.eraseComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.eraseComplete = jest.fn((unitOfWork) => { 
            throw new Error();
        });

        const underTest = new UseCaseDeleteCompleteTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.eraseComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseDeleteCompleteTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(undefined)).rejects.toThrow(Error);
    });
});