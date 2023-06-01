const { UnitOfWork } = require('../../shared/persistence/database');

async function createTask(task) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                `INSERT INTO tasks(task_id, title, created_at, updated_at, owner_id) VALUES(?, ?, ?, ?, ?)`,
                [task.id, task.title, task.createdAt, task.updatedAt, task.ownerId]);
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

async function updateTaskOwner(task) {
    UnitOfWork.begin()
        .then(async (db) => {
            await db.run(
                "UPDATE tasks SET owner_id=?, updated_at=? WHERE task_id=?"
                , [task.ownerId, new Date().toISOString(), task.id]);
            db.close();
        });
}

// TODO: Refactor this method to use a more function approach
async function listTasks(accountId) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await UnitOfWork.getDB().all('SELECT * FROM tasks t WHERE owner_id = ?', [accountId]);
            const result = queryResult.map(entry => new Task(entry.task_id, entry.title, new Date(entry.created_at), new Date(entry.updated_at), entry.owner_id));

            db.close();

            return result;
        });
}

async function listTasksWithoutOwner() {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.all("SELECT * FROM tasks WHERE owner_id is null", []);
            const result = queryResult.map(entry => new Task(entry.task_id, entry.title, new Date(entry.created_at), new Date(entry.updated_at), entry.owner_id));

            db.close();

            return result;
        });
}

async function listById(tasksIds = []) {
    return await UnitOfWork.begin()
        .then(async (db) => {
            const queryResult = await db.all('SELECT * FROM tasks WHERE task_id in (' + tasksIds.map(task => '?').join(',') + ')', tasksIds);
            return queryResult.map(entry => new Task(entry.task_id, entry.title, new Date(entry.created_at), new Date(entry.updated_at), entry.owner_id));
        });
}

async function deleteTask(id) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run('DELETE FROM tasks WHERE task_id = ?', [id]);
            // FIXME: This close should be done in the Unit of Work, not here
            db.close();
        })
}

async function deleteAllForAccount(accountId) {
    await UnitOfWork.begin()
        .then(async (db) => {
            await db.run('DELETE FROM tasks WHERE owner_id = ?', [accountId]);
            db.close();
        });
}

module.exports.TasksRepository = {
    createTask
    , updateTask
    , updateTaskOwner
    , listTasks
    , listTasksWithoutOwner
    , listById
    , deleteTask
    , deleteAllForAccount
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
module.exports.Task = Task;