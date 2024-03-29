const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseUpdateTasks } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Update Multiple Tasks Use Case", () => {
    it("Should succeed updating all tasks", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #2"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #3"
                , updatedAt: new Date()
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedTaskSyncsRepository = jest.fn();
        mockedTaskSyncsRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.update.mock.calls).toHaveLength(3);
        expect(mockedTasksRepository.update.mock.calls).toHaveLength(3);
    });

    it("Should succeed updating a single task", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , updatedAt: new Date()
            },
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedTaskSyncsRepository = jest.fn();
        mockedTaskSyncsRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.update.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should succeed updating no tasks", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });
        
        const mockedTaskSyncsRepository = jest.fn();
        mockedTaskSyncsRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.update.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncsRepository.update.mock.calls).toHaveLength(0);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #2"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #3"
                , updatedAt: new Date()
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { 
            if (task.title === tasksData[1].title) {
                throw new Error();
            }
        });

        const mockedTaskSyncsRepository = jest.fn();
        mockedTaskSyncsRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await expect(async () => await underTest.execute(unitOfWork, tasksData)).rejects.toThrow(Error);
        
        expect(mockedTasksRepository.update.mock.calls).toHaveLength(2);
        expect(mockedTaskSyncsRepository.update.mock.calls).toHaveLength(2);
    });

    it("Should fail, tasks sync repository error", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #2"
                , updatedAt: new Date()
            },
            {
                id: v4()
                , title: "Test task #3"
                , updatedAt: new Date()
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.update = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const mockedTaskSyncsRepository = jest.fn();
        mockedTaskSyncsRepository.update = jest.fn((unitOfWork, task) => {
            throw new Error();
        });

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await expect(async () => await underTest.execute(unitOfWork, tasksData)).rejects.toThrow(Error);
        
        expect(mockedTasksRepository.update.mock.calls).toHaveLength(0);
        expect(mockedTaskSyncsRepository.update.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksData = [];
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncsRepository = jest.fn();

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await expect(async () => await underTest.execute(undefined, tasksData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncsRepository = jest.fn();

        const underTest = UseCaseUpdateTasks(mockedTasksRepository, mockedTaskSyncsRepository);
        await expect(async () => await underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});
