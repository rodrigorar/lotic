const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseUpdateTask } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Update Task Use Case", () => {
    it("Should succeed updating a task", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = UseCaseUpdateTask(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskData);

        expect(mockedTasksRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { throw new Error(); });

        const underTest = UseCaseUpdateTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, taskData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();

        const underTest = UseCaseUpdateTask(mockedTasksRepository);
        expect(underTest.execute(undefined, taskData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = UseCaseUpdateTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
