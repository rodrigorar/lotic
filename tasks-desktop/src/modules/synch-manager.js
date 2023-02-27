const { AccountServices } = require("./accounts/services");
const { AuthServices } = require("./auth/services");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSynchServices } = require("./tasks_synch/services");
const { TASK_SYNCH_STATUS, TaskSynchRepository } = require("./tasks_synch/data");
const { Logger } = require("../shared/logging/logger");
const { StatusCode } = require("../shared/http/http");
const { webContents } = require("electron");

/***
 * HOW THE SYNCH SHOULD FUNCTION
 * 
 * 1. Insert new tasks to the server
 * 2. Update dirty tasks to server
 * 3. Get Tasks from Server
 * 4. Insert tasks that do not exist locally
 * 5. Update local tasks with server values
 * 6. Delete tasks that exist locally (non LOCAL) but do not exist in the server
 */

// TODO: Improve the design of the synch manager, and if possible, make it less 
// good functiony than this. rodrigorar - 27/02/2023

async function callCreateTasks(authToken, account, taskIds) {
    const tasks = await TaskServices.listById(taskIds);

    const tasksRequest = tasks
        .map(task => ({
            task_id: task.id
            , title: task.title
            , description: task.description ? task.description : ""
            , created_at: task.createdAt.toISOString()
            , updated_at: task.updatedAt.toISOString()
            , owner_id: authToken.accountId
        }));

    const result = await TasksRPC.createTasks(tasksRequest);
    if (result != undefined && 'ids' in result && result.ids.length == tasksRequest.length) {
        await TasksSynchServices.markSynched(taskIds);
    } else if ('status' in result && result.status === '409') {
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
    result = await TasksRPC.listTasks(account.id);
    return result.data.tasks.map(entry => ({
        task_id: entry.task_id
        , title: entry.title
        , description: entry.description
        , owner_id: entry.owner_id
    }));
}

async function doExecute(providedWebContents = undefined) {
    const eventHandler = 
        providedWebContents != undefined 
            ? providedWebContents 
            : webContents.getFocusedWebContents();
    
    const authToken = await AuthServices.getActiveSession();
    if (authToken == undefined) {
        Logger.info("Unable to run Synch Manager, no account logged in");
        return;
    }
    const account = await AccountServices.getAccountById(authToken.accountId);

    // Created tasks in server

    const createdTasksSynch = await TasksSynchServices.getNonSynched();

    const tasksToCreate = 
        createdTasksSynch
            .filter(task => task.synchStatus == TASK_SYNCH_STATUS.LOCAL)
            .map(taskSynch => taskSynch.taskId)
    if (tasksToCreate.length > 0) {
        await callCreateTasks(authToken, account, tasksToCreate);
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
        const existingTasks = await TaskServices.list(account.id);
        tasksToInsert = result
                .filter(result => existingTasks.filter(entry => entry.id == result.task_id).length == 0)
                .map(taskData => ({
                    id: taskData.task_id
                    , title: taskData.title
                    , createdAt: new Date() // FIXME: This should come from the server
                    , updatedAt: new Date() // FIXME: This should come from the server
                    , ownerId: authToken.accountId
                }));
        await TaskServices.createMultiple(tasksToInsert);
        tasksToInsert.forEach(entry => {
            TasksSynchServices.createSynchMonitor(entry.id, TASK_SYNCH_STATUS['SYNCHED'])
        })

        // FIXME: Update only tasks that need updating
        result.map(entry => TaskServices.update(
            entry.task_id
            , {
                id: entry.task_id
                , title: entry.title
                , createdAt: new Date() // FIXME: This should come from the server
                , updatedAt: new Date() // FIXME: This should come from the server
                , ownerId: entry.owner_id
            }))

        const refreshedTasks = await TaskServices.list(account.id);
        eventHandler.send('tasks:refresh', refreshedTasks);
    }

    const existingTasks = await TaskServices.list(account.id);
    if (existingTasks.length != 0) { 
        let tasksWithSynchStatus = [];
        if (result.length > 0) {
            tasksWithSynchStatus = existingTasks
                .map(async entry => {
                    const synchStatus = await TasksSynchServices.getSynchStatus(entry.id);
                    return {
                        id: entry.id
                        , taskSynchStatus: synchStatus.synchStatus
                    };
                });
        } else {
            tasksWithSynchStatus = existingTasks.map(async entry => {
                const synchStatus = await TasksSynchServices.getSynchStatus(entry.id);
                return {
                    id: entry.id
                    , tasksSynchStatus: synchStatus
                }
            });
        }

        Promise.all(tasksWithSynchStatus).then(async values => {
            const tasksToDelete = values
                .filter(entry => {
                    return result.filter(value => value.task_id == entry.id) == 0
                        && entry.taskSynchStatus != TASK_SYNCH_STATUS['LOCAL'];
                })
                .map(entry => entry.id);
            console.log(tasksToDelete);
            if (tasksToDelete.length > 0) {
                await TaskServices.deleteMultiple(tasksToDelete);
                await TasksSynchServices.deleteMultipleByTaskId(tasksToDelete);

                const refreshedTasks = await TaskServices.list(account.id);
                eventHandler.send('tasks:refresh', refreshedTasks); 
            }
        });
    }

    Logger.trace('Finished Task Synchornization, Refreshing');
}

async function execute(providedWebContents = undefined) {
    try {
        await doExecute(providedWebContents);
    } catch (e) {
        Logger.error('Failed to properly synch with server');
        Logger.error(e);
    }
} 

module.exports.SynchManager = {
    execute
}