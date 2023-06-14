const { generateId } = require('../../shared/utils/utils');
const { UnitOfWork } = require("../../shared/persistence/database");
const { Tables } = require('../../shared/persistence/tables');


// FIXME: We should have a single query method, and and update method that 
//  updates the status of the task syncs, after that we should remove all the
//  functions that are to specific for updating to a specific status or value. 
class TasksSyncRepository {

    async getLocalAndDirty(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        const queryResult = await queryManager.all(
            `SELECT * FROM ${Tables.TASKS_SYNC} WHERE synch_status = 'LOCAL' OR synch_status = 'DIRTY'`
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
            `SELECT * FROM ${Tables.TASKS_SYNC} WHERE synch_status = 'COMPLETE'`
            , []);
        return queryResult.map(row => new TaskSynch(
            row.task_synch_id
            , row.task_id
            , row.synch_status
            , new Date(row.created_at)
            , new Date(row.updated_at)));
    }

    async markForRemoval(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TASKS_SYNC} SET synch_status = 'COMPLETE', updated_at = ? WHERE task_id = ?`
            , [new Date().toISOString(), taskId]);
    }

    async markDirty(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE ${Tables.TASKS_SYNC} SET synch_status = 'DIRTY', updated_at = ? WHERE task_id = ? AND synch_status != 'LOCAL'`
            , [new Date().toISOString(), taskId]);
    }

    async markSynced(unitOfWork, taskIds) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `UPDATE tasks_sync SET ${Tables.TASKS_SYNC} = 'SYNCHED', updated_at = ? WHERE task_id in (` + taskIds.map(_ => '?').join(',') +")"
            , [new Date().toISOString(), ...taskIds]);
    }

    async deleteComplete(unitOfWork) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TASKS_SYNC} WHERE synch_status = 'COMPLETE'`
            , []);
    }

    async deleteMultipleByTaskId(unitOfWork, taskIds) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TASKS_SYNC} WHERE synch_status = 'COMPLETE' AND task_id in (` + taskIds.map(_ => '?').join(',') + ")"
            , taskIds);
    }

    async deleteAllForAccount(unitOfWork, accountId) {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TASKS_SYNC} WHERE task_id in (SELECT task_id FROM ${Tables.TASKS} WHERE owner_id = ?)`
            , [accountId]);
    }

    async create(unitOfWork, taskId, state = undefined) {
        const queryManager = unitOfWork.getQueryManager();
        const id = generateId();
        const currentDate = new Date();
    
        await queryManager.run(
            `INSERT INTO ${Tables.TASKS_SYNC}(task_synch_id, task_id, synch_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`
            , [id, taskId, state , currentDate.toISOString(), currentDate.toISOString()]);   
    }

    async getSyncStatus(unitOfWork, taskId) {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.get(
            `SELECT * FROM ${Tables.TASKS_SYNC} WHERE task_id = ?`
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
