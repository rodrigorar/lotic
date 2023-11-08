const { v4 } = require('uuid');
const { UseCaseDeleteAllTaskSyncsForAccount } = require('../../../../../src/domain/modules/tasks');
const { Errors } = require('../../../../../src/domain/errors');

describe("[Tasks Sync]: Test Delete All For Account Service", () => {
    
    it("Should succeed deleting all for account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedtasksSyncRepository = jest.fn();
        mockedtasksSyncRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => {
            // Do Nothing
        });

        const underTest = new UseCaseDeleteAllTaskSyncsForAccount(mockedtasksSyncRepository);
        await underTest.execute(unitOfWork, accountId);

        expect(mockedtasksSyncRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedtasksSyncRepository = jest.fn();
        mockedtasksSyncRepository.eraseAllForAccount = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = new UseCaseDeleteAllTaskSyncsForAccount(mockedtasksSyncRepository);
        expect(underTest.execute(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedtasksSyncRepository.eraseAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const mockedtasksSyncRepository = jest.fn();

        const underTest = new UseCaseDeleteAllTaskSyncsForAccount(mockedtasksSyncRepository);
        expect(underTest.execute(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedtasksSyncRepository = jest.fn();

        const underTest = new UseCaseDeleteAllTaskSyncsForAccount(mockedtasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
