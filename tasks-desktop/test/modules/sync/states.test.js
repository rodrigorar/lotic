const { StartSyncState, CreateTasksRemoteState, SyncDoneState } = require("../../../src/modules/sync/states");

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
        throw new Error("Should succeed create tasks remotelly is not implemented");
    });

    it("Should succeed no tasks to create remotely", async () => {
        throw new Error("Should succeed no tasks to create remotely is not implemented");
    });

    it("Should succeed remote error 409", async () => {
        throw new Error("Should succeed remote error 409 is not implemented");
    });

    it("Should fail, tasks sync services get non synced error", async () => {
        throw new Error("Should fail, tasks sync services error is not implemented");
    });

    it("Should fail, tasks sync services mark synced error", async () => {
        throw new Error("Should fail, tasks sync services mark synced error is not implemented");
    });

    it("Should fail, remote call error", async () => {
        throw new Error("Should fail, remote call error is not implemented");
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
