const { v4 } = require('uuid');
const { UseCaseMarkTaskSyncForRemoval } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Mark For Removal Service", () => {
    
    it("Should succeed marking tasks for removal", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => {
            // Do Nothing
        });

        const underTest = UseCaseMarkTaskSyncForRemoval(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskId);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => {
            throw new Error();
        });

        const underTest = UseCaseMarkTaskSyncForRemoval(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncForRemoval(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncForRemoval(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
