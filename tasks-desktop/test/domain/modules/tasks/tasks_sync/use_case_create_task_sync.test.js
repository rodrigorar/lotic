const { v4 } = require('uuid');
const { Errors } = require('../../../../../src/domain/errors');
const { TASK_SYNC_STATUS, UseCaseCreateTaskSync } = require('../../../../../src/domain/modules/tasks');

describe("[Tasks Sync]: Test Create Sync Monitor Service", () => {
    
    it("Should succeed creating a new sync monitor", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();
        const state = TASK_SYNC_STATUS.LOCAL;

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, state) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTaskSync(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskId, state);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should succeed, no state provided", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, state) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTaskSync(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, taskId, undefined);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, state) => { 
            throw new Error();
        });

        const underTest = UseCaseCreateTaskSync(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, taskId, undefined)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseCreateTaskSync(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, taskId, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseCreateTaskSync(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });

});
