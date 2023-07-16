const { v4 } = require('uuid');
const { UseCaseMarkTaskSyncsSynced } = require('../../../../../src/domain/modules/tasks/domain');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Mark Synced Service", () => {
    
    it("Should succeed marking all tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should succeed marking single task as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should succeed marking no tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskIds)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskIds = [v4(), v4(), v4()];
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskIds)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new UseCaseMarkTaskSyncsSynced(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});