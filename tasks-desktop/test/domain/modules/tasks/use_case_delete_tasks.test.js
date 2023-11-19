const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseDeleteTasks } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Delete Multiple Tasks Use Case", () => {

    it("Should succeed deleting multiple tasks", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(3);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should succeed deleting a single task", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4()];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should succeed, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should succeed deleting no tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should fail task repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork));
    });

    it("Should fail task sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn(() => {
            throw new Error();
        });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork));
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksRepository = jest.fn();

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        await expect(async () => await underTest.execute(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
