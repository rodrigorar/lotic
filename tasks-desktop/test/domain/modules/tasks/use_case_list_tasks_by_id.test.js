const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { Task, UseCaseListTasksById, TASK_SYNC_STATUS } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test List Tasks by Id Use Case", () => {
    it("Should succeed listing tasks by id", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const dbResult = [
            new Task(v4(), "Task #1", 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", 2, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), accountId)
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listById = jest.fn((unitOfWork, taskIds) => dbResult);

        const underTest = UseCaseListTasksById(mockedTasksRepository);
        const result = await underTest.execute(unitOfWork, dbResult.map(value => value.id));

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksRepository.listById.mock.calls).toHaveLength(1);
    });

    it("Should succeed listing tasks by id no ids provided", async () => {
        const unitOfWork = jest.fn();
        const dbResult = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listById = jest.fn((unitOfWork, taskIds) => dbResult);

        const underTest = UseCaseListTasksById(mockedTasksRepository);
        const result = await underTest.execute(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(0);

        expect(mockedTasksRepository.listById.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listById = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = UseCaseListTasksById(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, [])).rejects.toThrow(Error);

        expect(mockedTasksRepository.listById.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksRepository = jest.fn();

        const underTest = UseCaseListTasksById(mockedTasksRepository);
        expect(underTest.execute(undefined, [])).rejects.toThrow(Errors.NullArgumentError);
    });
});
