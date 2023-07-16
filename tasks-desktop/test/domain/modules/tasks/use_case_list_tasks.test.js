const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { Task, UseCaseListTasksForAccount } = require('../../../../src/domain/modules/tasks/domain');

describe("[Tasks]: Test List Tasks For Account Use Case", () => {
    
    it("Should succeed listing tasks", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const dbResult = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listByAccountId = jest.fn((unitOfWork, accountId) => dbResult);

        const underTest = new UseCaseListTasksForAccount(mockedTasksRepository);
        const result = await underTest.execute(unitOfWork, accountId);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksRepository.listByAccountId.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listByAccountId = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = new UseCaseListTasksForAccount(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedTasksRepository.listByAccountId.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseListTasksForAccount(mockedTasksRepository);
        expect(underTest.execute(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseListTasksForAccount(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
