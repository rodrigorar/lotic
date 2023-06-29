const { v4 } = require("uuid");
const { TASK_SYNCH_STATUS, TaskSynch } = require("../../../src/modules/tasks_synch/data");
const { TasksSyncServices } = require("../../../src/modules/tasks_synch/services");
const { Errors } = require("../../../src/shared/errors/errors");

describe("[Tasks Sync]: Test Create Sync Monitor Service", () => {
    
    it("Should succeed creating a new sync monitor", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();
        const state = TASK_SYNCH_STATUS.LOCAL;

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, state) => { /* Do Nothing */ });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.createSyncMonitor(unitOfWork, taskId, state);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(1);
    });

    it("Should succeed, no state provided", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, state) => { /* Do Nothing */ });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.createSyncMonitor(unitOfWork, taskId, undefined);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, state) => { 
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createSyncMonitor(unitOfWork, taskId, undefined)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createSyncMonitor(undefined, taskId, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createSyncMonitor(unitOfWork, undefined, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });

});

describe("[Tasks Sync]: Test Create Multiple Sync Monitors Service", () => {
    
    it("Should succeed creating multiple new sync monitors", async () => {
       const unitOfWork = jest.fn();
       const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            },
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            },
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            }
       ]; 

       const mockedTasksSyncRepository = jest.fn();
       mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

       const underTest = new TasksSyncServices(mockedTasksSyncRepository);
       await underTest.createMultipleSyncMonitor(unitOfWork, tasksSyncData);

       expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(3);
    });

    it("Should succeed creating a single new sync monitor", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.createMultipleSyncMonitor(unitOfWork, tasksSyncData);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(1);
    });

    it("Should succeed creating no new sync monitors", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = []; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.createMultipleSyncMonitor(unitOfWork, tasksSyncData);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(0);
    });

    it("Should fail, Tasks Sync Repository error", async () => {
        const unitOfWork = jest.fn();
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.create = jest.fn((unitOfWork, taskId, status) => { 
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createMultipleSyncMonitor(unitOfWork, tasksSyncData)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.create.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksSyncData = [
            {
                taskId: v4()
                , taskSyncData: TASK_SYNCH_STATUS.LOCAL
            },
        ]; 

        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createMultipleSyncMonitor(undefined, tasksSyncData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no tasks sync data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.createMultipleSyncMonitor(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Delete Complete Service", () => {

    it("Should succeed deleting complete task syncs", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.deleteComplete = jest.fn((unitOfWork) => { /* Do Nothing */ });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.deleteComplete(unitOfWork);

        expect(mockedTasksSyncRepository.deleteComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.deleteComplete = jest.fn((unitOfWork) => { 
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.deleteComplete(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.deleteComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.deleteComplete(undefined)).rejects.toThrow(Error);
    });
});

describe("[Tasks Sync]: Test Multiple by Task Id Service", () => {
    
    it("Should succeed deleting multiple by task id", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.deleteMultipleByTaskId = jest.fn((unitOfWork, taskIds) => {
            // Do Nothing
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.deleteMultipleByTaskId(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.deleteMultipleByTaskId.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.deleteMultipleByTaskId = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.deleteMultipleByTaskId(unitOfWork, taskIds)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.deleteMultipleByTaskId.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskIds = [v4(), v4(), v4()];
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.deleteMultipleByTaskId(undefined, taskIds)).rejects.toThrow(Error);
    });

    it("Should fail, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.deleteMultipleByTaskId(unitOfWork, undefined)).rejects.toThrow(Error);
    });
});

describe("[Tasks Sync]: Test Delete All For Account Service", () => {
    
    it("Should succeed deleting all for account", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedtasksSyncRepository = jest.fn();
        mockedtasksSyncRepository.deleteAllForAccount = jest.fn((unitOfWork, accountId) => {
            // Do Nothing
        });

        const underTest = new TasksSyncServices(mockedtasksSyncRepository);
        await underTest.deleteAllForAccount(unitOfWork, accountId);

        expect(mockedtasksSyncRepository.deleteAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedtasksSyncRepository = jest.fn();
        mockedtasksSyncRepository.deleteAllForAccount = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedtasksSyncRepository);
        expect(underTest.deleteAllForAccount(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedtasksSyncRepository.deleteAllForAccount.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const mockedtasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedtasksSyncRepository);
        expect(underTest.deleteAllForAccount(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedtasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedtasksSyncRepository);
        expect(underTest.deleteAllForAccount(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Mark For Removal Service", () => {
    
    it("Should succeed marking tasks for removal", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => {
            // Do Nothing
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.markForRemoval(unitOfWork, taskId);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.update = jest.fn((unitOfWork, taskSyncData) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markForRemoval(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markForRemoval(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markForRemoval(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Mark Dirty Service", () => {
    
    it("Should succeed marking a task sync as dirty", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.markDirty = jest.fn((unitOfWork, taskId) => {
            // Do Nothing
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.markDirty(unitOfWork, taskId);

        expect(mockedTasksSyncRepository.markDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.markDirty = jest.fn((unitOfWork, taskId) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markDirty(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.markDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markDirty(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markDirty(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Mark Synced Service", () => {
    
    it("Should succeed marking all tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4(), v4(), v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.markSynced(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should succeed marking single task as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [v4()];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.markSynced(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should succeed marking no tasks as synced", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toBeDefined();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        await underTest.markSynced(unitOfWork, taskIds);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskIds = [];

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.updateMultiple = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markSynced(unitOfWork, taskIds)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.updateMultiple.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskIds = [v4(), v4(), v4()];
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markSynced(undefined, taskIds)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task ids provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.markSynced(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Get Non Synced Service", () => {
    
    it("Should succeed getting non synced tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getLocalAndDirty = jest.fn((unitOfWork) => {
            return [
                new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.LOCAL, new Date(), new Date())
                , new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.DIRTY, new Date(), new Date())
                , new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.LOCAL, new Date(), new Date())
            ];
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        const result = await underTest.getNonSynced(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksSyncRepository.getLocalAndDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getLocalAndDirty = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getNonSynced(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.getLocalAndDirty.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getNonSynced(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Get Complete Service", () => {
    
    it("Should succeed getting complete tasks", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getComplete = jest.fn((unitOfWork) => {
            return [
                new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.COMPLETE, new Date(), new Date())
                , new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.COMPLETE, new Date(), new Date())
                , new TaskSynch(v4(), v4(), TASK_SYNCH_STATUS.COMPLETE, new Date(), new Date())
            ];
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        const result = await underTest.getComplete(unitOfWork);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksSyncRepository.getComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getComplete = jest.fn((unitOfWork) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getComplete(unitOfWork)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.getComplete.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getComplete(undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks Sync]: Test Get Sync Status Service", () => {
    
    it("Should succeed getting task sync status", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getSyncStatus = jest.fn((unitOfWork, taskId) => {
            return new TaskSynch(v4(), taskId, TASK_SYNCH_STATUS.SYNCHED, new Date(), new Date());
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        const result = await underTest.getSyncStatus(unitOfWork, taskId);

        expect(result).toBeDefined();
        expect(result.taskId).toBe(taskId);

        expect(mockedTasksSyncRepository.getSyncStatus.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const taskId = v4();

        const mockedTasksSyncRepository = jest.fn();
        mockedTasksSyncRepository.getSyncStatus = jest.fn((unitOfWork, taskId) => {
            throw new Error();
        });

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getSyncStatus(unitOfWork, taskId)).rejects.toThrow(Error);

        expect(mockedTasksSyncRepository.getSyncStatus.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskId = v4();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getSyncStatus(undefined, taskId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksSyncRepository = jest.fn();

        const underTest = new TasksSyncServices(mockedTasksSyncRepository);
        expect(underTest.getSyncStatus(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});