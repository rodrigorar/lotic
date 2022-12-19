const { Logger } = require('../../handlers/logging');
const { UnitOfWork } = require('../shared/database');

function createTask(task) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO tasks(task_id, title, state, created_at, updated_at) VALUES(?, ?, ?, ?, ?)`,
                [task.id, task.title, task.state, task.createdAt, task.updatedAt]);
            db.close();
        });
}

function updateTask(taskId, data) {
    // TODO: This code needs to be way more efficient, it currently calls this for every letter inputted. 
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'UPDATE tasks SET title=?, updated_at=? WHERE task_id=?', 
                [data.title, data.updatedAt, taskId]);
            db.close();
        });
}

async function listTasks() {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = await UnitOfWork.getDB().all('SELECT * FROM tasks', []);
    result = queryResult.map(entry => new Task(entry.task_id, entry.title, entry.state, entry.created_at, entry.updated_at));
    UnitOfWork.end();

    return result;
}

async function listById(taskIdList = []) {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = await UnitOfWork.getDB().all('SELECT * FROM tasks WHERE task_id in (?)', [taskIds]);
    result = queryResult.map(entry => new Task(entry.task_id, entry.title, entry.state, entry.created_at, entry.update_at));
    UnitOfWork.end();

    return result;
}

function deleteTask(id) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run('DELETE FROM tasks where task_id = ?', [id]);
            await db.run('DELETE FROM tasks_sync WHERE task_id = ?', [id]);
            db.close();
        })
}

module.exports.TasksRepository = {
    createTask,
    updateTask,
    listTasks,
    listById, 
    deleteTask
}

module.exports.TASK_STATE = {
    IN_TODO: "IN_TODO",
    COMPLETED: "COMPLETED",
    DELETED: "DELETED"
}

class Task {
    constructor(id, title, state, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.state = state;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
module.exports.Task = Task;