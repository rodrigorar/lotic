const { generateId } = require('../../shared/utils/utils');
const { Tables, Fields } = require('../../shared/persistence/tables');


// FIXME: We should have a single query method, and and update method that 
//  updates the status of the task syncs, after that we should remove all the
//  functions that are to specific for updating to a specific status or value. 
class TasksSyncRepository {

    async create(unitOfWork, taskId, state = undefined) {
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
        return queryResult.map(row => new TaskSynch(
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
        return queryResult.map(row => new TaskSynch(
            row.task_synch_id
            , row.task_id
            , row.synch_status
            , new Date(row.created_at)
            , new Date(row.updated_at)));
    }

    async getSyncStatus(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.TaskId} = ?`
            , [taskId]);
        
        if (result != undefined) {
            return new TaskSynch(
                result.task_synch_id
                , result.task_id
                , result.synch_status
                , new Date(result.created_at)
                , new Date(result.updated_at))
        }  

        return result ? new TaskSynch(
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

    async deleteComplete(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE'`
            , []);
    }

    async deleteMultipleByTaskId(unitOfWork, taskIds) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE' AND ${Fields.TasksSync.TaskId} in (` + taskIds.map(_ => '?').join(',') + ")"
            , taskIds);
    }

    async deleteAllForAccount(unitOfWork, accountId) {
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

const TASK_SYNCH_STATUS = {
    LOCAL: "LOCAL", // The task was never synched
    SYNCHED: "SYNCHED", // The task is synched and hasn't been changed locally
    DIRTY: "DIRTY", // The task is synched but has been changed locally
    COMPLETE: "COMPLETE" // The task is competed and has not been synched with the server yet. 
}

class TaskSynch {
    constructor(id, taskId, synchStatus, createdAt, updatedAt) {
        this.id = id;
        this.taskId = taskId;
        this.synchStatus = synchStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports.TASK_SYNCH_STATUS = TASK_SYNCH_STATUS;
module.exports.TaskSynch = TaskSynch;
module.exports.TasksSyncRepository = TasksSyncRepository;
