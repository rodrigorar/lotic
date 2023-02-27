const { generateId } = require('../../shared/utils/utils');
const { UnitOfWork } = require("../../shared/persistence/database");


async function getLocalAndDirty() {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = await UnitOfWork.getDB().all(
        "SELECT * FROM tasks_synch WHERE synch_status = 'LOCAL' OR synch_status = 'DIRTY'"
        , []);
    result = queryResult.map(row => new TaskSynch(row.task_synch_id, row.task_id, row.synch_status, new Date(row.created_at), new Date(row.updated_at)));
    UnitOfWork.end();

    return result;
}

async function getComplete() {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = await UnitOfWork.getDB().all(
        "SELECT * FROM tasks_synch WHERE synch_status = 'COMPLETE'"
        , []);
    result = queryResult.map(row => new TaskSynch(row.task_synch_id, row.task_id, row.synch_status, new Date(row.created_at), new Date(row.updated_at)));
    UnitOfWork.end();

    return result;
}

async function markForRemoval(taskId) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "UPDATE tasks_synch SET synch_status = 'COMPLETE', updated_at = ? WHERE task_id = ?"
                , [new Date().toISOString(), taskId]);
            db.close();
        });
}

async function markDirty(taskId) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "UPDATE tasks_synch SET synch_status = 'DIRTY', updated_at = ? WHERE task_id = ? AND synch_status != 'LOCAL'"
                , [new Date().toISOString(), taskId]);
            db.close();
        });
}

async function markSynched(taskIds) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "UPDATE tasks_synch SET synch_status = 'SYNCHED', updated_at = ? WHERE task_id in (" + taskIds.map(_ => '?').join(',') +")"
                , [new Date().toISOString(), ...taskIds]
            )
            db.close();
        });
}

async function deleteComplete() {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "DELETE FROM tasks_synch WHERE synch_status = 'COMPLETE'"
                , []);
            db.close();
        });
}

async function deleteMultipleByTaskId(taskIds) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "DELETE FROM tasks_synch WHERE synch_status = 'COMPLETE' AND task_id in (" + taskIds.map(_ => '?').join(',') + ")"
                , taskIds);
            db.close();
        });
}

async function create(taskId, state = undefined) {
    db_state = state == undefined ? TASK_SYNCH_STATUS['LOCAL'] : state;
    await UnitOfWork.begin()
        .then(async (db) => {
            const id = generateId();
            const currentDate = new Date();

            await db.run(
                "INSERT INTO tasks_synch(task_synch_id, task_id, synch_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
                , [id, taskId, db_state , currentDate.toISOString(), currentDate.toISOString()]);

            db.close();
        });
}

async function getSynchStatus(taskId) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const row = await db.get(
                "SELECT * FROM tasks_synch WHERE task_id = ?"
                , [taskId]);
            
            if (row != undefined) {
                return new TaskSynch(row.task_synch_id, row.task_id, row.synch_status, new Date(row.created_at), new Date(row.updated_at))
            }  
            return undefined;
        });
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
module.exports.TaskSynchRepository = {
    getLocalAndDirty
    , getComplete
    , markForRemoval
    , markDirty
    , markSynched
    , create
    , deleteComplete
    , deleteMultipleByTaskId
    , getSynchStatus
}
