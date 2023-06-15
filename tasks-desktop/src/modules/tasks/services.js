const { EventBus, EventType, EventSubscriber } = require("../../shared/event-bus");
const { RunUnitOfWork } = require("../../shared/persistence/unitofwork");
const { Validators } = require("../../shared/utils/utils");
const { TasksRepository, Task } = require("./data");
const { v4 } = require("uuid");

class TasksServices {

    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }

    async create(unitOfWork, taskData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data was provided!");

        const task = 
            new Task(
                taskData.id
                , taskData.title
                , taskData.createdAt
                , taskData.updatedAt
                , taskData.ownerId);
        await this.tasksRepository.createTask(unitOfWork, task);
    }

    async createMultiple(unitOfWork, tasksData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksData, "No tasks where provided");
    
        const tasks = tasksData
            .map(taskData => 
                    new Task(
                        taskData.id
                        , taskData.title
                        , taskData.createdAt
                        , taskData.updatedAt
                        , taskData.ownerId));
        for (let task of tasks) {
            await this.tasksRepository.createTask(unitOfWork, task);
        }
    }

    async update(unitOfWork, taskData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(taskData, "No task data provided");

        await this.tasksRepository.updateTask(unitOfWork, taskData);
    }

    async updateMultiple(unitOfWork, tasksData) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(tasksData, "No task data list provided");

        for (let taskData of tasksData) {
            await this.tasksRepository.updateTask(unitOfWork, taskData)
        }
    }

    async list(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        Validators.isNotNull(accountId, "No account id provided");
        
        return await this.tasksRepository.listTasks(unitOfWork, accountId);
    }

    async listTasksWithoutOwner(unitOfWork) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksRepository.listTasksWithoutOwner(unitOfWork);
    }

    async listById(unitOfWork, taskIdList = []) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");

        return await this.tasksRepository.listById(unitOfWork, taskIdList);p
    }

    async deleteTask(unitOfWork, taskId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(taskId, "No task id provided");

        await this.tasksRepository.deleteTask(unitOfWork, taskId);
    }

    async deleteMultiple(unitOfWork, taskIds = []) {
        Validators.isNotNull(unitOfWork, "No Unit Of Work provided");
        
        taskIds
            .forEach(async taskId => await this.tasksRepository.deleteTask(unitOfWork, taskId));
    }

    async deleteAllForAccount(unitOfWork, accountId) {
        Validators.isNotNull(unitOfWork, "No Unit of Work provided");
        Validators.isNotNull(accountId, "No account id provided");

        this.tasksRepository.deleteAllForAccount(unitOfWork, accountId);
    }
}

module.exports.TaskServices = new TasksServices(new TasksRepository());

// Event Bus Subscribers

EventBus.register(
    EventType.LOGIN_SUCCESS
    , new EventSubscriber(v4(), async (event) => {
        const tasksRepository = new TasksRepository();
        const tasksServices = new TasksServices(tasksRepository);
        RunUnitOfWork.run(async (unitOfWork) => {
            const tasksWithoutOwner = await tasksServices.listTasksWithoutOwner(unitOfWork);
            tasksWithoutOwner.forEach(async (task) => { 
                task.ownerId = event.body.account_id;
                await tasksRepository.updateTaskOwner(unitOfWork, task)
            });
        });
    }));