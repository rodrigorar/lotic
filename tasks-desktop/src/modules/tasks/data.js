const { UnitOfWork } = require('../../shared/persistence/database');
const { Tables } = require('../../shared/persistence/tables');

class TasksRepository {

    async createTask(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.TASKS}(task_id, title, created_at, updated_at, owner_id) VALUES(?, ?, ?, ?, ?)`,
            [task.id, task.title, task.createdAt, task.updatedAt, task.ownerId]);
    }

    async updateTask(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TASKS} SET title=?, updated_at=? WHERE task_id=?`, 
            [task.title, task.updatedAt.toISOString(), task.id]);
    }

    async updateTaskOwner(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TASKS} SET owner_id=?, updated_at=? WHERE task_id=?`
            , [task.ownerId, new Date().toISOString(), task.id]);
    }

    async listTasks(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * FROM ${Tables.TASKS} t WHERE owner_id = ?`, [accountId])
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
            .all(`SELECT * FROM ${Tables.TASKS} WHERE owner_id is null`, []);
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
            .all(`SELECT * FROM ${Tables.TASKS} WHERE task_id in (` + tasksIds.map(task => '?').join(',') + ')', tasksIds);
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }
    
    async deleteTask(unitOfWork, id) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.TASKS} WHERE task_id = ?`, [id]);
    }

    async deleteAllForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.TASKS} WHERE owner_id = ?`, [accountId]);
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