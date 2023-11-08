const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseDeleteTask } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Delete Task Use Case", () => {
    
    it("Should succeed deleting the task", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { /* Do nothing */ });

        const underTest = new UseCaseDeleteTask(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskId);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.erase = jest.fn((unitOfWork, taskId) => { 
            throw new Error();
        });

        const underTest = new UseCaseDeleteTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksRepository.erase.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseDeleteTask(mockedTasksRepository);
        expect(underTest.execute(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id is provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseDeleteTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
