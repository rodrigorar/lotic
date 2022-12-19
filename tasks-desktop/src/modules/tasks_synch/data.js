const { generateId } = require('../shared/utils');
const { UnitOfWork } = require("../shared/database");


async function getLocalAndDirty() {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = UnitOfWork.getDB().all(
        "SELECT * FROM tasks_synch WHERE synch_states = 'LOCAL' OR synch_states = 'DIRTY'",
        []);
    result = queryResult.map(row => new TaskSynch(row.task_synch_id, row.task_id, row.synch_status, row.created_at, row.updated_at));
    UnitOfWork.end();

    return result;
}

function cleanup() {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "DELETE FROM tasks_synch WHERE synch_states = 'SYNCHED'", 
                []);
            db.close();
        });
}

function markDirty(taskId) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "UPDATE tasks_synch SET synch_status = 'DIRTY', updated_at = ? WHERE task_id = ?",
                [new Date(), taskId]);
            db.close();
        });
}

function create(taskId) {
    UnitOfWork.begin()
        .then(async (db) => {
            const id = generateId();
            const currentDate = new Date();

            await db.run(
                "INSERT INTO tasks_synch(task_synch_id, task_id, synch_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                [id, taskId, TASK_SYNCH_STATUS['LOCAL'], currentDate, currentDate]);

            db.close();
        });
}

module.exports.TaskSynchRepository = {
    getLocalAndDirty,
    cleanup,
    markDirty,
    create
}

const TASK_SYNCH_STATUS = {
    LOCAL: "LOCAL", // The task was never synched
    SYNCHED: "CLEAN", // The task is synched and hasn't been changed locally
    DIRTY: "DIRTY", // The task is synched but has been changed locally
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

module.exports.TasksSynchData = {
    TASK_SYNCH_STATUS,
    TaskSynch
}