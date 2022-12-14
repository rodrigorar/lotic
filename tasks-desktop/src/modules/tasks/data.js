const { database } = require('../shared/database');

function createTask(task) {
    // TODO: Not implemented
    return null;
}

function updateTask(id, newTaskValues) {
    // TODO: Not implemented
}

function getTask(id) {
    // TODO: Not implemented
    return null;
}

function getTasks(offset, limit) {
    // TODO: Not implemented
    return null;
}

function deleteTask(id) {
    // TODO: Not implemented
}

module.exports.TasksRepository = {
    createTask,
    updateTask,
    getTask,
    getTasks,
    deleteTask
}

const TASK_STATE = {
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
        this.updateAt = updatedAt;
    }
}

module.exports.TasksData {
    TASK_STATE,
    Task
}