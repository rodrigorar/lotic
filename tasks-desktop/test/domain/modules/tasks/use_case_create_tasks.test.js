const { v4 } = require('uuid');
const { Errors } = require('../../../../src/domain/errors');
const { UseCaseCreateTasks } = require('../../../../src/domain/modules/tasks');

describe("[Tasks]: Test Create Multiple Tasks Use Case", () => {
    it("Should succeed creating all tasks", async () => {
        const unitOfWork = jest.fn();
        const ownerId = v4();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , position: 0
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #2"
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #3"
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(tasksData.map(value => value.id)).toContain(task.id);
            expect(tasksData.map(value => value.title)).toContain(task.title);
            expect(task.ownerId).toBe(ownerId);
        });
        mockedTasksRepository.getMaxPosition = jest.fn((unitOfWork) => 0);

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(3);
        expect(mockedTasksRepository.getMaxPosition.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.save.mock.calls).toHaveLength(3);
    });

    it("Should succeed creating a single task", async () => {
        const unitOfWork = jest.fn();
        const ownerId = v4();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(tasksData.map(value => value.id)).toContain(task.id);
            expect(tasksData.map(value => value.title)).toContain(task.title);
            expect(task.ownerId).toBe(ownerId);
        });
        mockedTasksRepository.getMaxPosition = jest.fn((unitOfWork) => 0);

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.getMaxPosition.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should succeed creating no tasks", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => { /* Do Nothing */ });
        mockedTasksRepository.getMaxPosition = jest.fn((unitOfWork) => 0);

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await underTest.execute(unitOfWork, tasksData);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(0);
        expect(mockedTasksRepository.getMaxPosition.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.save.mock.calls).toHaveLength(0);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const ownerId = v4();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , position: 0
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #2"
                , position: 1
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #3"
                , position: 2
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            if (id == tasksData[1].id) {
                throw new Error();
            }
        });
        mockedTasksRepository.getMaxPosition = jest.fn((unitOfWork) => 0);

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { /* Do Nothing */ });

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        expect(underTest.execute(unitOfWork, tasksData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(0);
        expect(mockedTasksRepository.getMaxPosition.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.save.mock.calls).toHaveLength(0);
    });

    it("Should succeed creating all tasks", async () => {
        const unitOfWork = jest.fn();
        const ownerId = v4();
        const tasksData = [
            {
                id: v4()
                , title: "Test task #1"
                , position: 0
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #2"
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            },
            {
                id: v4()
                , title: "Test task #3"
                , createdAt: new Date()
                , updatedAt: new Date()
                , ownerId: ownerId
            }
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(tasksData.map(value => value.id)).toContain(task.id);
            expect(tasksData.map(value => value.title)).toContain(task.title);
            expect(task.ownerId).toBe(ownerId);
        });
        mockedTasksRepository.getMaxPosition = jest.fn((unitOfWork) => 0);

        const mockedTaskSyncRepository = jest.fn();
        mockedTaskSyncRepository.save = jest.fn((unitOfWork, taskId, status) => { 
            throw new Error();
        });

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        await expect(async () => await underTest.execute(unitOfWork, tasksData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(1);
        expect(mockedTasksRepository.getMaxPosition.mock.calls).toHaveLength(1);
        expect(mockedTaskSyncRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksData = [];
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        expect(underTest.execute(undefined, tasksData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();
        const mockedTaskSyncRepository = jest.fn();

        const underTest = UseCaseCreateTasks(mockedTasksRepository, mockedTaskSyncRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});