const { UseCaseGetBySyncStatus, TASK_SYNC_STATUS, Task } = require("../../../../src/domain/modules/tasks");

describe("[Tasks]: Test Get Task By Sync Status Use Case", () => {

    it('Should succeed getting tasks by status', async () => {
        const ownerId = 'owner-1';
        const repoResult = [
            new Task(1, 'Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), ownerId)
            , new Task(2, 'Task #2', 1, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), ownerId)
            , new Task(3, 'Task #3', 2, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), ownerId)
        ];

        const mockedUnitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.getBySyncState = jest.fn((unitOfWork, syncStatus) => repoResult);

        const underTest = UseCaseGetBySyncStatus(mockedTasksRepository);
        const result = await underTest.execute(mockedUnitOfWork, [TASK_SYNC_STATUS.LOCAL]);

        expect(result.length).toBe(3);
        expect(mockedTasksRepository.getBySyncState.mock.calls).toHaveLength(1);
    });

    it('Should succeed get tasks by status with no status', async () => {
        const ownerId = 'owner-1';
        const repoResult = [
            new Task(1, 'Task #1', 0, TASK_SYNC_STATUS.LOCAL, new Date(), new Date(), ownerId)
            , new Task(2, 'Task #2', 1, TASK_SYNC_STATUS.DIRTY, new Date(), new Date(), ownerId)
            , new Task(3, 'Task #3', 2, TASK_SYNC_STATUS.SYNCED, new Date(), new Date(), ownerId)
        ];

        const mockedUnitOfWork = jest.fn();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.getBySyncState = jest.fn((unitOfWork, syncStatus) => repoResult);

        const underTest = UseCaseGetBySyncStatus(mockedTasksRepository);
        const result = await underTest.execute(mockedUnitOfWork, []);

        expect(result.length).toBe(3);
        expect(mockedTasksRepository.getBySyncState.mock.calls).toHaveLength(1);
    });

    it('Should fail tasks repository error', async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.getBySyncState = jest.fn((unitOfWork, syncStatus) => {
            throw new Error();
        });

        const underTest = UseCaseGetBySyncStatus(mockedTasksRepository);
        await expect(async () => await underTest.execute(mockedUnitOfWork, [TASK_SYNC_STATUS.LOCAL])).rejects.toThrow(Error);
    });

    it('Should fail, no unit of work provided', async () => {
        const mockedTasksRepository = jest.fn();
        const underTest = UseCaseGetBySyncStatus(mockedTasksRepository);
        await expect(async () => await underTest.execute(null, [TASK_SYNC_STATUS.LOCAL])).rejects.toThrow(Error);
    });

    it('Should fail, null syncStatus provided', async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        const underTest = UseCaseGetBySyncStatus(mockedTasksRepository);
        await expect(async () => await underTest.execute(mockedUnitOfWork, null)).rejects.toThrow(Error);
    });
});