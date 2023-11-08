const { v4 } = require('uuid');
const { UseCaseMarkTaskSyncDirty } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Mark Dirty Service", () => {
    
    it("Should succeed marking a task sync as dirty", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.markDirty = jest.fn((unitOfWork, taskId) => {
            // Do Nothing
        });

        const underTest = UseCaseMarkTaskSyncDirty(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskId);

        expect(mockedTasksSyncRepository.markDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.markDirty = jest.fn((unitOfWork, taskId) => {
            throw new Error();
        });

        const underTest = UseCaseMarkTaskSyncDirty(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.markDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncDirty(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncDirty(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});