const { v4 } = require('uuid');
const { UseCaseMarkTaskSyncsSynced } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Mark Synced Service", () => {
    
    it("Should succeed marking all tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(3);
    });

    it("Should succeed marking single task as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should succeed marking no tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(0);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, taskIds)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(0);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskIds = [v4(), v4(), v4()];
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await expect(async () => await underTest.execute(null, taskIds)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, null)).rejects.toThrow(Errors.NullArgumentError);
    });
});