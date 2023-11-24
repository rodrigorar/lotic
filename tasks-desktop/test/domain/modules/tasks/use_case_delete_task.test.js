const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseDeleteTask, Task, TASK_SYNC_STATUS } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Delete Task Use Case", () => {
    
    it("Should succeed deleting the task", async () => {
        const unitOfWork = jest.fn();
        const fakeTask = new Task(v4(), 'Test Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), v4());

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.get = jest.fn((unitOfWork, taskId) => fakeTask);
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, fakeTask.id);

        expect(mockedTasksRepository.get.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should succeed deleting a task without owner", async () => {
        const unitOfWork = jest.fn();
        const fakeTask = new Task(v4(), 'Test Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), null);

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.get = jest.fn((unitOfWork, taskId) => fakeTask);
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, fakeTask.id);

        expect(mockedTasksRepository.get.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(1);
    });

    it("Should succeed non existing task", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.get = jest.fn((unitOfWork, taskId) => undefined);
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { /* Do nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseByTaskIds = jest.fn((unitOfWork, taskIds) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, v4());

        expect(mockedTasksRepository.get.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncRepository.eraseByTaskIds.mock.calls).toHaveLength(0);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const fakeTask = new Task(v4(), 'Test Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), v4());

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.get = jest.fn((unitOfWork, taskId) => fakeTask);
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { 
            throw new Error();
        });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.update = jest.fn((entry) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, fakeTask.id)).rejects.toThrow(Error);

        expect(mockedTasksRepository.get.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, task sync repository error", async () => {
        const unitOfWork = jest.fn();
        const fakeTask = new Task(v4(), 'Test Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), v4());

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.get = jest.fn((unitOfWork, taskId) => fakeTask);
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { /* Do Nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => {
            throw new Error();
        });

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, fakeTask.id)).rejects.toThrow(Error);

        expect(mockedTasksRepository.get.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id is provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseDeleteTask(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
