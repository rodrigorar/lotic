const { AccountServices } = require("./accounts/services");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSynchServices } = require("./tasks_synch/services");
const { TASK_SYNCH_STATUS } = require("./tasks_synch/data");
const { Logger } = require("./shared/logger");
const { StatusCode } = require("./shared/http");
const { webContents } = require("electron");

async function callCreateTasks(account, taskIds) {
    const tasks = await TaskServices.listById(taskIds);

    const tasksRequest = tasks
        .map(task => ({
            task_id: task.id
            , title: task.title
            , description: task.description ? task.description : ""
            , created_at: task.createdAt.toISOString()
            , updated_at: task.updatedAt.toISOString()
            , owner_id: account.id
        }));

    const result = await TasksRPC.createTasks(tasksRequest);
    if (result != undefined && result.ids.length == tasksRequest.length) {
        await TasksSynchServices.markSynched(taskIds);
    }
} 

async function callUpdateTasks(taskIds) {
    const tasks = await TaskServices.listById(taskIds);

    const tasksRequest = tasks
    .map(task => ({
        task_id: task.id
        , title: task.title
        , description: task.description ? task.description : ""
        , updated_at: task.updatedAt.toISOString()
    }));

    const result = await TasksRPC.updateTasks(tasksRequest);
    if (result != undefined) {
        await TasksSynchServices.markSynched(taskIds);
    }
}

async function callDeleteTasks(taskIds) {
    const result = [];    

    for (const taskId of taskIds) {
        if (taskId != undefined) {
            try {
                await TasksRPC.deleteTasks(taskId);
                result.push(taskId);
            } catch (e) {
                if (e.response.status == StatusCode.NotFound) {
                    result.push(taskId);
                } else {
                    Logger.error(e);
                }
            }
        }
    }

    return result;
}

async function callListServerTasks(account) {
    const result = await TasksRPC.listTasks(account.id);
    return result.data.tasks.map(data => JSON.parse(data));
}

async function doExecute() {
    const account = await AccountServices.getLoggedAccount();

    // Created tasks in server

    const createdTasksSynch = await TasksSynchServices.getNonSynched();

    const tasksToCreate = 
        createdTasksSynch
            .filter(task => task.synchStatus == TASK_SYNCH_STATUS.LOCAL)
            .map(taskSynch => taskSynch.taskId)
    if (tasksToCreate.length > 0) {
        await callCreateTasks(account, tasksToCreate);
    }

    // Update tasks in server

    const tasksToUpdate =
        createdTasksSynch
            .filter(task => task.synchStatus == TASK_SYNCH_STATUS.DIRTY)
            .map(tasksSynch => tasksSynch.taskId);
    if (tasksToUpdate.length > 0) {
        await callUpdateTasks(tasksToUpdate);
    }

    // Delete completed tasks from the server

    const completeTasksSynch = await TasksSynchServices.getComplete();
    if (completeTasksSynch.length > 0) {
        const tasksToDelete = completeTasksSynch.map(task => task.taskId);
        const tasksSynchToDelete = await callDeleteTasks(tasksToDelete);
        if (tasksSynchToDelete.length > 0) {
            await TasksSynchServices.deleteMultipleByTaskId(tasksSynchToDelete);
        }
    }

    // Get Tasks from server

    const result = await callListServerTasks(account);
    let tasksToInsert = undefined;
    if (result.length > 0) {
        const existingTasks = await TaskServices.list();
        tasksToInsert = result
                .filter(result => existingTasks.filter(entry => entry.id == result.task_id).length == 0)
                .map(taskData => ({
                    id: taskData.task_id
                    , title: taskData.title
                    , createdAt: new Date() // TODO: This should come from the server
                    , updatedAt: new Date() // TODO: This should come from the server
                }));
                
        if (tasksToInsert.length > 0) {
            await TaskServices.createMultiple(tasksToInsert);
            result.forEach(async taskData => {
                await TasksSynchServices.createSynchMonitor(taskData.task_id, TASK_SYNCH_STATUS.SYNCHED);
            });
        }
    }

    if (tasksToInsert != undefined && tasksToInsert.length > 0) {
        webContents.getFocusedWebContents().send('tasks:refresh', await TaskServices.list());
    }

    Logger.trace('Finished Task Synchornization');
}

async function execute() {
    try {
        await doExecute();
    } catch (e) {
        Logger.error('Failed to properly synch with server');
        Logger.error(e);
    }
} 

module.exports.SynchManager = {
    execute
}