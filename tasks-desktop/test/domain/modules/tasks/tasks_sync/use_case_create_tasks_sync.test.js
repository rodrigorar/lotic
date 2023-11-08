const { v4 } = require('uuid');
const { Errors } = require('../../../../../src/domain/errors');
const { TASK_SYNC_STATUS, UseCaseCreateTaskSyncs } = require('../../../../../src/domain/modules/tasks');

describe("[Tasks Sync]: Test Create Multiple Sync Monitors Service", () => {
    
    it("Should succeed creating multiple new sync monitors", async () => {
       const unitOfWork = jest.fn();
       const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            },
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            },
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            }
       ]; 

       const mockedTasksSyncRepository = jest.fn();
       mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

       const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
       await underTest.execute(unitOfWork, tasksSyncData);

       expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(3);
    });

    it("Should succeed creating a single new sync monitor", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, tasksSyncData);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should succeed creating no new sync monitors", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = []; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
        await underTest.execute(unitOfWork, tasksSyncData);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(0);
    });

    it("Should fail, Tasks Sync Repository error", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { 
            throw new Error();
        });

        const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, tasksSyncData)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNC_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(undefined, tasksSyncData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no tasks sync data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = UseCaseCreateTaskSyncs(mockedTasksSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
