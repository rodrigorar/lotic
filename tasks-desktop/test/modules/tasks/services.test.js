const { v4 } = require("uuid");
const { TaskServices } = require("../../../src/modules/tasks/services");
const { Errors } = require("../../../src/shared/errors/errors");
const { Task } = require("../../../src/modules/tasks/data");

describe("[Tasks]: Test Create Service", () => {
    
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
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(task.id).toBe(taskData.id);
            expect(task.title).toBe(taskData.title);
            expect(task.createdAt).toBe(taskData.createdAt);
            expect(task.updatedAt).toBe(taskData.updatedAt);
            expect(task.ownerId).toBe(taskData.ownerId);
        });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.create(unitOfWork, taskData);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(1);
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
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => {
            throw new Error();
        });

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.create(unitOfWork, taskData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(1);
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

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.create(undefined, taskData)).rejects.toThrow(Error);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.create(unitOfWork, undefined)).rejects.toThrow(Error);
    });
});

describe("[Tasks]: Test Create Multiple Service", () => {
    it("Should succeed creating all tasks", async () => {
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
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(tasksData.map(value => value.id)).toContain(task.id);
            expect(tasksData.map(value => value.title)).toContain(task.title);
            expect(task.ownerId).toBe(ownerId);
        });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.createMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(3);
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
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => {
            expect(task).not.toBeNull();
            expect(tasksData.map(value => value.id)).toContain(task.id);
            expect(tasksData.map(value => value.title)).toContain(task.title);
            expect(task.ownerId).toBe(ownerId);
        });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.createMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(1);
    });

    it("Should succeed creating no tasks", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.createMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(0);
    });

    it("Should fail, tasks repository error", async () => {
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
        mockedTasksRepository.createTask = jest.fn((unitOfWork, task) => {
            if (id == tasksData[1].id) {
                throw new Error();
            }
        });

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.createMultiple(unitOfWork, tasksData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.createTask.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksData = [];
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.createMultiple(undefined, tasksData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.createMultiple(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks]: Test Update Service", () => {
    it("Should succeed updating a task", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.update(unitOfWork, taskData);

        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { throw new Error(); });

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.update(unitOfWork, taskData)).rejects.toThrow(Error);

        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const taskData = {
            id: v4()
            , title: "New title for task #1"
            , updatedAt: new Date()
        };

        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.update(undefined, taskData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.update(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks]: Test Update Multiple Service", () => {
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
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.updateMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(3);
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
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.updateMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(1);
    });

    it("Should succeed updating no tasks", async () => {
        const unitOfWork = jest.fn();
        const tasksData = [];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { /* Do Nothing */ });

        const underTest = new TaskServices(mockedTasksRepository);
        await underTest.updateMultiple(unitOfWork, tasksData);

        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(0);
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
        mockedTasksRepository.updateTask = jest.fn((unitOfWork, task) => { 
            if (task.title === tasksData[1].title) {
                throw new Error();
            }
        });

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.updateMultiple(unitOfWork, tasksData)).rejects.toThrow(Error);
        
        expect(mockedTasksRepository.updateTask.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const tasksData = [];
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.updateMultiple(undefined, tasksData)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no task data provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.updateMultiple(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

describe("[Tasks]: Test List Service", () => {
    
    it("Should succeed listing tasks", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();
        const dbResult = [
            new Task(v4(), "Task #1", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #2", new Date(), new Date(), accountId)
            , new Task(v4(), "Task #3", new Date(), new Date(), accountId)
        ];

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listTasks = jest.fn((unitOfWork, accountId) => dbResult);

        const underTest = new TaskServices(mockedTasksRepository);
        const result = await underTest.list(unitOfWork, accountId);

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(mockedTasksRepository.listTasks.mock.calls).toHaveLength(1);
    });

    it("Should fail, tasks repository error", async () => {
        const unitOfWork = jest.fn();
        const accountId = v4();

        const mockedTasksRepository = jest.fn();
        mockedTasksRepository.listTasks = jest.fn((unitOfWork, accountId) => {
            throw new Error();
        });

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.list(unitOfWork, accountId)).rejects.toThrow(Error);

        expect(mockedTasksRepository.listTasks.mock.calls).toHaveLength(1);
    });

    it("Should fail, no unit of work provided", async () => {
        const accountId = v4();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.list(undefined, accountId)).rejects.toThrow(Errors.NullArgumentError);
    });

    it("Should fail, no account id provided", async () => {
        const unitOfWork = jest.fn();
        const mockedTasksRepository = jest.fn();

        const underTest = new TaskServices(mockedTasksRepository);
        expect(underTest.list(unitOfWork, undefined)).rejects.toThrow(Errors.NullArgumentError);
    });
});

// describe("[Tasks]: Test List Without Owner Service", () => {
    
//     it("Should succeed listing tasks without owner", async () => {
//         throw new Error("Should succeed listing tasks without owner is not implemented");
//     });

//     it("Should fail, tasks repository error", async () => {
//         throw new Error("Should fail, tasks repository error is not implemented");
//     });

//     it("Should fail, no unit of work provided", async () => {
//         throw new Error("Should fail, no unit of work provided is not implemented");
//     });
// });

// describe("[Tasks]: Test List by Id Service", () => {
//     it("Should succeed listing tasks by id", async () => {
//         throw new Error("Should succeed listing tasks by id is not implemented");
//     });

//     it("Should fail, tasks repository error", async () => {
//         throw new Error("Should fail, tasks repository error is not implemented");
//     });

//     it("Should fail, no unit of work provided", async () => {
//         throw new Error("Should fail, no unit of work provided is not implemented");
//     });

//     it("Should fail, not task id list provided", async () => {
//         throw new Error("Should fail, not task id list provided is not implemented");
//     });
// });

// describe("[Tasks]: Test Delete Service", () => {
//     it("Should succeed deleting the task", async () => {
//         throw new Error("Should succeed deleting the task is not implemented");
//     });

//     it("Should fail, tasks repository error", async () => {
//         throw new Error("Should fail, tasks repository error is not implemented");
//     });

//     it("Should fail, no unit of work provided", async () => {
//         throw new Error("Should fail, no unit of work provided is not implemented");
//     });

//     it("Should fail, no task id is provided", async () => {
//         throw new Error("Should fail, no task id is provided is not implemented");
//     });
// });

// describe("[Tasks]: Test Delete Multiple Service", () => {
//     it("Should succeed deleting multiple tasks", async () => {
//         throw new Error("Should succeed deleting multiple tasks is not implemented");
//     });

//     it("Should succeed deleting a single task", async () => {
//         throw new Error("Should succeed deleting a single task is not implemented");
//     });

//     it("Should succeed deleting no tasks", async () => {
//         throw new Error("Should succeed deleting no tasks is not implemented");
//     });

//     it("Should fail, no unit of work provided", async () => {
//         throw new Error("Should fail, no unit of work provided is not implemented");
//     });

//     it("Should fail, no task ids provided", async () => {
//         throw new Error("Should fail, no task ids provided is not implemented");
//     });
// });

// describe("[Tasks]: Test Delete All For Account Service", () => {
//     it("Should succeed deleting all tasks for account", async () => {
//         throw new Error("Should succeed deleting all tasks for account is not implemented");
//     });

//     it("Should fail, tasks repository error", async () => {
//         throw new Error("Should fail, Should fail, tasks repository error is not implemented");
//     });

//     it("Should fail, no unit of work provided", async () => {
//         throw new Error("Should fail, no unit of work provided is not implemented");
//     });

//     it("Should fail, no account id provided", async () => {
//         throw new Error("Should fail, no account id provided is not implemented");
//     });
// });