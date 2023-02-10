const { UnitOfWork } = require('../shared/database');

function createTask(task) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO tasks(task_id, title, state, created_at, updated_at) VALUES(?, ?, ?, ?, ?)`,
                [task.id, task.title, task.state, task.createdAt.toISOString(), task.updatedAt.toISOString()]);
            db.close();
        });
}

function updateTask(taskId, data) {
    // TODO: This code needs to be way more efficient, it currently calls this for every letter inputted. 
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                'UPDATE tasks SET title=?, updated_at=? WHERE task_id=?', 
                [data.title, data.updatedAt.toISOString(), taskId]);
            db.close();
        });
}

async function listTasks() {
    let result = [];

    await UnitOfWork.begin();
    const queryResult = await UnitOfWork.getDB().all('SELECT * FROM tasks', []);
    result = queryResult.map(entry => new Task(entry.task_id, entry.title, entry.state, new Date(entry.created_at), new Date(entry.updated_at)));
    UnitOfWork.end();

    return result;
}

async function listById(tasksIds = []) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.all('SELECT * FROM tasks WHERE task_id in (' + tasksIds.map(task => '?').join(',') + ')', tasksIds);
            return queryResult.map(entry => new Task(entry.task_id, entry.title, entry.state, new Date(entry.created_at), new Date(entry.updated_at)));
        });
}

async function deleteTask(id) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run('DELETE FROM tasks where task_id = ?', [id]);
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
    COMPLETED: "COMPLETED"
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