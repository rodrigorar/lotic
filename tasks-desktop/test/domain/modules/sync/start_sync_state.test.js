const { v4 } = require('uuid');
const { 
    StartSyncState
    , SyncDoneState
    , CreateTasksRemoteState 
} = require('../../../../src/infrastructure/modules/sync/states');

describe("[Sync]: Test Sync State", () => {
    
    it("Should succeed with active session", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkRunner = jest.fn();
        mockedUnitOfWorkRunner.run = jest.fn(async (work) => await work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn(() => jest.fn())


        const underTest = new StartSyncState(mockedUnitOfWorkRunner, mockedGetActiveSessionUseCase);
        const result = await underTest.next();

        expect(result).toBeDefined();
        expect(result instanceof CreateTasksRemoteState).toBe(true);

        expect(mockedUnitOfWorkRunner.run.mock.calls).toHaveLength(1)
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });

    it("Should succeed with no active session", async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedUnitOfWorkRunner = jest.fn();
        mockedUnitOfWorkRunner.run = jest.fn(async (work) => await work(mockedUnitOfWork));

        const mockedGetActiveSessionUseCase = jest.fn();
        mockedGetActiveSessionUseCase.execute = jest.fn(() => undefined)

        const underTest = new StartSyncState(
            mockedUnitOfWorkRunner
            , mockedGetActiveSessionUseCase);
        const result = await underTest.next();

        expect(result).toBeDefined();
        expect(result instanceof SyncDoneState).toBe(true);

        expect(mockedUnitOfWorkRunner.run.mock.calls).toHaveLength(1)
        expect(mockedGetActiveSessionUseCase.execute.mock.calls).toHaveLength(1);
    });
});