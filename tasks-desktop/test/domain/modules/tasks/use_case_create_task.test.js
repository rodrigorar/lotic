const { v4 } = require('uuid');
const { UseCaseCreateTask } = require('../../../../src/domain/modules/tasks/domain');

describe("[Tasks]: Test Create Task Use Case", () => {
    
    it("Should succeed creating a task", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "Test title"
            , createdAt: new Date()
            , updatedAt: new Date()
            , ownerId: v4()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(task.id).toBe(taskData.id);
            expect(task.title).toBe(taskData.title);
            expect(task.createdAt).toBe(taskData.createdAt);
            expect(task.updatedAt).toBe(taskData.updatedAt);
            expect(task.ownerId).toBe(taskData.ownerId);
        });

        const underTest = new UseCaseCreateTask(mockedTasksRepository);
        await underTest.execute(unitOfWork, taskData);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "Test title"
            , createdAt: new Date()
            , updatedAt: new Date()
            , ownerId: v4()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.save = jest.fn((unitOfWork, task) => {
            throw new Error();
        });

        const underTest = new UseCaseCreateTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, taskData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.save.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskData = {
            id: v4()
            , title: "Test title"
            , createdAt: new Date()
            , updatedAt: new Date()
            , ownerId: v4()
        };

        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseCreateTask(mockedTasksRepository);
        expect(underTest.execute(undefined, taskData)).rejects.toThrow(Error);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new UseCaseCreateTask(mockedTasksRepository);
        expect(underTest.execute(unitOfWork, undefined)).rejects.toThrow(Error);
    });
});