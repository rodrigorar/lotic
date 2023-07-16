const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { Task, UseCaseListTasksWithoutOwner } = require('../../../../src/domain/modules/tasks/domain');

describe("[Tasks]: Test List Tasks Without Owner Use Case", () => {
    
    it("Should succeed listing tasks without owner", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const dbResult = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listWithoutOwner = jest.fn((unitOfWork) => dbResult);

        const underTest = new UseCaseListTasksWithoutOwner(mockedTasksRepository);
        const result = await underTest.execute(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksRepository.listWithoutOwner.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listWithoutOwner = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const underTest = new UseCaseListTasksWithoutOwner(mockedTasksRepository);
        expect(underTest.execute(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksRepository.listWithoutOwner.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseListTasksWithoutOwner(mockedTasksRepository);
        expect(underTest.execute(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
