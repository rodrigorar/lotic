const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseDeleteTasks } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Delete Multiple Tasks Use Case", () => {

    it("Should succeed deleting multiple tasks", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(3);
    });

    it("Should succeed deleting a single task", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4()];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
    });

    it("Should succeed, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskIds);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
    });

    it("Should succeed deleting no tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskIds) => { /* Do nothing */ });

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        await underTest.execute(unitOfWork);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(0);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksRepository = jest.fn();

        const underTest = UseCaseDeleteTasks(mockedTasksRepository);
        expect(underTest.execute(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
