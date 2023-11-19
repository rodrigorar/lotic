const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseDeleteAllTasksForAccount } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Delete All For Account Service", () => {
    it("Should succeed deleting all tasks for account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        
        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteAllTasksForAccount(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, accountId);

        expect(mockedTasksRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        
        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => { 
            throw new Error();
        });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const underTest = UseCaseDeleteAllTasksForAccount(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedTasksRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, task sync repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        
        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => { /* Do Nothing */ });

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = UseCaseDeleteAllTasksForAccount(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedTasksRepository.eraseAllForAccount.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseDeleteAllTasksForAccount(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseDeleteAllTasksForAccount(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});