const { v4 } = require("uuid");
const { AuthToken } = require("../../../src/modules/auth/data");
const { StartSyncState, CreateTasksRemoteState, SyncDoneState, CreateTasksLocalStateEffect, CreateTasksRemoteStateEffect } = require("../../../src/modules/sync/states");
const { TaskSynch, TASK_SYNCH_STATUS } = require("../../../src/modules/tasks_synch/data");
const { Task } = require("../../../src/modules/tasks/data");

describe("[Sync]: Test Sync State", () => {
    
    it("Should succeed with active session", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkRunner = jest.fn();
        mockedUnitOfWorkRunner.run = jest.fn(async (work) => await work(mockedUnitOfWork));

        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn(() => jest.fn())
        const mockedAccountServices = jest.fn();
        const mockedTasksServices = jest.fn();
        const mockedTasksSyncServices = jest.fn();
        const mockedTasksRPC = jest.fn();

        const underTest = new StartSyncState(
            mockedUnitOfWorkRunner
            , () => mockedAuthServices
            , () => mockedAccountServices
            , () => mockedTasksServices
            , () => mockedTasksSyncServices
            , () => mockedTasksRPC);
        const result = await underTest.next();

        expect(result).toBeDefined();
        expect(result instanceof CreateTasksRemoteState).toBe(true);

        expect(mockedUnitOfWorkRunner.run.mock.calls).toHaveLength(1)
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should succeed with no active session", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkRunner = jest.fn();
        mockedUnitOfWorkRunner.run = jest.fn(async (work) => await work(mockedUnitOfWork));

        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn(() => undefined)
        const mockedAccountServices = jest.fn();
        const mockedTasksServices = jest.fn();
        const mockedTasksSyncServices = jest.fn();
        const mockedTasksRPC = jest.fn();

        const underTest = new StartSyncState(
            mockedUnitOfWorkRunner
            , () => mockedAuthServices
            , () => mockedAccountServices
            , () => mockedTasksServices
            , () => mockedTasksSyncServices
            , () => mockedTasksRPC);
        const result = await underTest.next();

        expect(result).toBeDefined();
        expect(result instanceof SyncDoneState).toBe(true);

        expect(mockedUnitOfWorkRunner.run.mock.calls).toHaveLength(1)
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
    });
});

describe("[Sync]: Test Create Tasks Remote State Effect", () => {
    
    it("Should succeed create tasks remotelly", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSynch(v4(), unsyncedTasks[0].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[1].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[2].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        mockedTaskServices.listById = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        mockedTaskSyncServices.markSynced = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });
        const mockedTasksRPC = jest.fn();
        mockedTasksRPC.createTasks = jest.fn((unitOfWork, request) => ({
            status: 200
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
        expect(mockedTaskServices.listById.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncServices.getNonSynced.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncServices.markSynced.mock.calls).toHaveLength(1);
        expect(mockedTasksRPC.createTasks.mock.calls).toHaveLength(1);
    });

    it("Should succeed no tasks to create remotely", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [];
        const unsyncedTaskSyncs = [];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        const mockedTasksRPC = jest.fn();

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncServices.getNonSynced.mock.calls).toHaveLength(1);
    });

    it("Should succeed remote error 409", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSynch(v4(), unsyncedTasks[0].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[1].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[2].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        mockedTaskServices.listById = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        mockedTaskSyncServices.markSynced = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });
        const mockedTasksRPC = jest.fn();
        mockedTasksRPC.createTasks = jest.fn((unitOfWork, request) => ({
            status: 409
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        await underTest.execute();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
        expect(mockedTaskServices.listById.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncServices.getNonSynced.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncServices.markSynced.mock.calls).toHaveLength(1);
        expect(mockedTasksRPC.createTasks.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync services get non synced error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => {
            throw new Error();
        });
        const mockedTasksRPC = jest.fn();

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks sync services mark synced error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSynch(v4(), unsyncedTasks[0].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[1].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[2].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        mockedTaskServices.listById = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        mockedTaskSyncServices.markSynced = jest.fn((unitOfWork, taskIds) => {
            throw new Error();
        });
        const mockedTasksRPC = jest.fn();
        mockedTasksRPC.createTasks = jest.fn((unitOfWork, request) => ({
            status: 200
            , ids: unsyncedTasks.map(task => task.id)
        }));

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        expect(underTest.execute()).rejects.toThrow(Error);

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
    });

    it("Should fail, remote call error", async () => {
        const accessToken = v4();
        const refreshToken = v4();
        const accountId = v4();
        const unsyncedTasks = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];
        const unsyncedTaskSyncs = [
            new TaskSynch(v4(), unsyncedTasks[0].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[1].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
            , new TaskSynch(v4(), unsyncedTasks[2].id, TASK_SYNCH_STATUS["LOCAL"], new Date(), new Date())
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkProvider = jest.fn();
        mockedUnitOfWorkProvider.run = jest.fn((work) => work(mockedUnitOfWork));
        const mockedAuthServices = jest.fn();
        mockedAuthServices.getActiveSession = jest.fn((unitOfWork) => new AuthToken(accessToken, refreshToken, accountId, new Date()));
        const mockedAccountServices = jest.fn();
        const mockedTaskServices = jest.fn();
        mockedTaskServices.listById = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
            return unsyncedTasks;
        });
        const mockedTaskSyncServices = jest.fn();
        mockedTaskSyncServices.getNonSynced = jest.fn((unitOfWork) => unsyncedTaskSyncs);
        mockedTaskSyncServices.markSynced = jest.fn((unitOfWork, taskIds) => {
            expect(taskIds).toHaveLength(3);
        });
        const mockedTasksRPC = jest.fn();
        mockedTasksRPC.createTasks = jest.fn((unitOfWork, request) => {
            throw new Error();
        });

        const underTest = new CreateTasksRemoteStateEffect(
            mockedUnitOfWorkProvider
            , mockedAuthServices
            , mockedAccountServices
            , mockedTaskServices
            , mockedTaskSyncServices
            , mockedTasksRPC);
        expect(underTest.execute()).rejects.toThrow();

        expect(mockedUnitOfWorkProvider.run.mock.calls).toHaveLength(1);
        expect(mockedAuthServices.getActiveSession.mock.calls).toHaveLength(1);
    });
});

describe("[Sync]: Test Update Tasks Remote State Effect", () => {
    
    it("Should succeed update tasks remotelly", async () => {
        throw new Error("Should succeed update tasks remotelly is not implemented");
    });

    it("Should succeed no tasks to update remotelly", async () => {
        throw new Error("Should succeed no tasks to update remotelly is not implemented");
    });

    it("Should fail, get non synced tasks error", async () => {
        throw new Error("Should fail, get non synced tasks error is not implemented");
    });

    it("Should fail, list by id error", async () => {
        throw new Error("Should fail, list by id error is not implemented");
    });

    it("Should fail, remote call error", async () => {
        throw new Error("Should fail, remote call error is not implemented");
    });

    it("Should fail, mark synced error", async () => {
        throw new Error("Should fail, mark synced error is not implemented");
    });
});

describe("[Sync]: Test Delete Tasks Remote State Effect", () => {
    
    it("Should succeed delete tasks remotelly", async () => {
        throw new Error("Should succeed delete tasks remotelly is not implemented");
    });

    it("Should succeed no tasks to delete remotelly", async () => {
        throw new Error("Should succeed no tasks to delete remotelly is not implemented");
    });

    it("Should fail, get complete error", async () => {
        throw new Error("Should fail, get complete error is not implemented");
    });

    it("Should fail, remote call error", async () => {
        throw new Error("Should fail, remote call error is not implemented");
    });

    it("Should fail, delete multiple by task id error", async () => {
        throw new Error("Should fail, delete multiple by task id error is not implemented");
    });
});

describe("[Sync]: Test Create Tasks Local State Effect", () => {
    
    it("Should succeed create local tasks", async () => {
        throw new Error("Should succeed create local tasks is not implemented");
    });

    it("Should succeed no tasks to create locally", async () => {
        throw new Error("Should succeed no tasks to create locally is not implemented");
    });

    it("Should fail, no active session error", async () => {
        throw new Error("Should fail, no active session error is not implemented");
    })

    it("Should fail, remote call error", async () => {
        throw new Error("Should fail, remote call error is not implemented");
    });

    it("Should fail, list service error", async () => {
        throw new Error("Should fail, list service error is not implemented");
    });

    it("Should fail, create multiple tasks error", async () => {
        throw new Error("Should fail, create multiple tasks error is not implemented");
    });

    it("Should fail, create multiple tasks sync error", async () => {
        throw new Error("Should fail, create multiple tasks sync error is not implemented");
    });
});

describe("[Sync]: Test Update Tasks Local State Effect", () => {
    
    it("Should succeed to update tasks locally", async () => {
        throw new Error("Should succeed to update tasks locally is not implemented");
    });

    it("Should succeed no tasks to update locally", async () => {
        throw new Error("Should succeed no tasks to update locally is not implemented");
    });

    it("Should fail, no active session error", async () => {
        throw new Error("Should fail, no active session error is not implemented");
    });

    it("Should fail, remote call error", async () => {
        throw new Error("Should fail, remote call error is not implemented");
    });

    it("Should fail, update tasks service error", async () => {
        throw new Error("Should fail, update tasks services error is not implemented");
    });
});

describe("[Sync]: Test Delete Tasks Local State Effect", () => {
    
    it("Should succeed delete local tasks", async () => {
        throw new Error("Should succeed delete local tasks is not implemented");
    });

    it("Should succeed no tasks to delete locally", async () => {
        throw new Error("Should succeed no tasks to delete locally is not implemented");
    });

    it("Should fail no active session error", async () => {
        throw new Error("Should fail no active session error is not implemented");
    });

    it("Should fail remote call error", async () => {
        throw new Error("Should fail remote call error is not implemented");
    });

    it("Should fail, list tasks error", async () => {
        throw new Error("Should fail, list tasks error is not implemented");
    });

    it("Should fail, get sync status error", async () => {
        throw new Error("Should fail, get sync status error is not implemented");
    });

    it("Should fail, delete multiple tasks error", async () => {
        throw new Error("Should fail, delete multiple tasks error is not implemented");
    });

    it("Should fail, delete multiple tasks sync error", async () => {
        throw new Error("Should fail, delete multiple tasks sync error is not implemented");
    });
});
