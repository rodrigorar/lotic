const { generateId } = require("../../../domain/shared/utils");
const { TasksRepository, TaskSyncRepository } = require("../../../domain/modules/tasks/data");
const { Tables, Fields } = require("../../persistence/tables");
const { Task, TaskSync, TASK_SYNC_STATUS } = require("../../../domain/modules/tasks/domain");

class TasksRepositoryImpl extends TasksRepository {

    async save(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.Tasks}`
            + `(${Fields.Tasks.Id}, ${Fields.Tasks.Title}, ${Fields.Tasks.CreatedAt}, ${Fields.Tasks.UpdatedAt}, ${Fields.Tasks.OwnerId}) `
            + `VALUES(?, ?, ?, ?, ?)`,
            [task.id, task.title, task.createdAt.toISOString(), task.updatedAt.toISOString(), task.ownerId]);
    }

    // FIXME: This should be on the save function
    async update(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.Tasks} `
            + `SET ${Fields.Tasks.Title}=?, ${Fields.Tasks.UpdatedAt}=? `
            + `WHERE ${Fields.Tasks.Id}=?`, 
            [task.title, task.updatedAt.toISOString(), task.id]);
    }

    // FIXME: This should be on the save function
    async updateTaskOwner(unitOfWork, task) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.Tasks} `
            + `SET ${Fields.Tasks.OwnerId}=?, ${Fields.Tasks.UpdatedAt}=? `
            + `WHERE ${Fields.Tasks.Id}=?`
            , [task.ownerId, new Date().toISOString(), task.id]);
    }

    async listByAccountId(unitOfWork, accountId) {
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

    async listWithoutOwner(unitOfWork) {
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
    
    async erase(unitOfWork, id) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.Id} = ?`, [id]);
    }

    async eraseAllForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.OwnerId} = ?`, [accountId]);
    }
}

class TasksSyncRepositoryImpl extends TaskSyncRepository {

    async save(unitOfWork, taskId, state = undefined) {
        const queryManager = unitOfWork.getQueryManager();
        const id = generateId();
        const currentDate = new Date();

        await queryManager.run(
            `INSERT INTO ${Tables.TasksSync}`
            + `(${Fields.TasksSync.Id}, task_id, synch_status, created_at, updated_at) `
            + `VALUES (?, ?, ?, ?, ?)`
            , [id, taskId, state , currentDate.toISOString(), currentDate.toISOString()]);   
    }

    async markDirty(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TasksSync} `
            + `SET ${Fields.TasksSync.Status} = 'DIRTY', ${Fields.TasksSync.UpdatedAt} = ? `
            + `WHERE ${Fields.TasksSync.TaskId} = ? AND ${Fields.TasksSync.Status} != 'LOCAL'`
            , [new Date().toISOString(), taskId]);
    }

    async getLocalAndDirty(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        const queryResult = await queryManager.all(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'LOCAL' OR ${Fields.TasksSync.Status} = 'DIRTY'`
            , []);
        return queryResult.map(row => new TaskSync(
            row.task_synch_id
            , row.task_id
            , row.synch_status
            , new Date(row.created_at)
            , new Date(row.updated_at)));
    }

    async getComplete(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        const queryResult = await queryManager.all(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE'`
            , []);
        return queryResult.map(row => new TaskSync(
            row.task_synch_id
            , row.task_id
            , row.synch_status
            , new Date(row.created_at)
            , new Date(row.updated_at)));
    }

    async get(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.TaskId} = ?`
            , [taskId]);
        
        if (result != undefined) {
            return new TaskSync(
                result.task_synch_id
                , result.task_id
                , result.synch_status
                , new Date(result.created_at)
                , new Date(result.updated_at))
        }  

        return result ? new TaskSync(
            result.task_sync_id
            , result.task_id
            , result.synch_status
            , new Date(result.created_at)
            , new Date(result.updated_at)) : undefined;
    }

    async update(unitOfWork, taskSyncData) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TasksSync} `
            + `SET ${Fields.TasksSync.Status} = ?, ${Fields.TasksSync.UpdatedAt} = ? `
            + `WHERE ${Fields.TasksSync.TaskId} = ?`
            , [taskSyncData.status, new Date().toISOString(), taskSyncData.taskId])
    }

    async updateMultiple(unitOfWork, tasksSyncData) {
        for (let taskSyncData of tasksSyncData) {
            this.update(unitOfWork, taskSyncData);
        }
    }

    async eraseComplete(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE'`
            , []);
    }

    async eraseByTaskIds(unitOfWork, taskIds) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE' AND ${Fields.TasksSync.TaskId} in (` + taskIds.map(_ => '?').join(',') + ")"
            , taskIds);
    }

    async eraseAllForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.Tasks.Id} in (`
                + `SELECT ${Fields.Tasks.Id} `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.OwnerId} = ?)`
            , [accountId]);
    }

}


module.exports.TasksRepositoryImpl = TasksRepositoryImpl;
module.exports.TasksSyncRepositoryImpl = TasksSyncRepositoryImpl;