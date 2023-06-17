const { Tables, Fields } = require('../../shared/persistence/tables');

class TasksRepository {

    async createTask(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.Tasks}`
            + `(${Fields.Tasks.Id}, ${Fields.Tasks.Title}, ${Fields.Tasks.CreatedAt}, ${Fields.Tasks.UpdatedAt}, ${Fields.Tasks.OwnerId}) `
            + `VALUES(?, ?, ?, ?, ?)`,
            [task.id, task.title, task.createdAt.toISOString(), task.updatedAt.toISOString(), task.ownerId]);
    }

    async updateTask(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.Tasks} `
            + `SET ${Fields.Tasks.Title}=?, ${Fields.Tasks.UpdatedAt}=? `
            + `WHERE ${Fields.Tasks.Id}=?`, 
            [task.title, task.updatedAt.toISOString(), task.id]);
    }

    async updateTaskOwner(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.Tasks} `
            + `SET ${Fields.Tasks.OwnerId}=?, ${Fields.Tasks.UpdatedAt}=? `
            + `WHERE ${Fields.Tasks.Id}=?`
            , [task.ownerId, new Date().toISOString(), task.id]);
    }

    async listTasks(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * FROM `
                + `${Tables.Tasks} t `
                + `WHERE ${Fields.Tasks.OwnerId} = ?`, [accountId])
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }

    async listTasksWithoutOwner(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.OwnerId} is null`, []);
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }

    async listById(unitOfWork, tasksIds = []) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.Id} in (` + tasksIds.map(task => '?').join(',') + ')', tasksIds);
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }
    
    async deleteTask(unitOfWork, id) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.Id} = ?`, [id]);
    }

    async deleteAllForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.OwnerId} = ?`, [accountId]);
    }
}

class Task {
    constructor(id, title, createdAt, updatedAt, ownerId) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
    }
}

module.exports.TasksRepository = TasksRepository;
module.exports.Task = Task;