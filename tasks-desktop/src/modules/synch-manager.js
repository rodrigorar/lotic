const { AccountServices } = require("./accounts/services");
const { AuthServices } = require("./auth/services");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSyncServices } = require("./tasks_synch/services");
const { TASK_SYNCH_STATUS } = require("./tasks_synch/data");
const { Logger } = require("../shared/logging/logger");
const { StatusCode } = require("../shared/http/http");
const { webContents } = require("electron");
const { RunUnitOfWork } = require("../shared/persistence/unitofwork");

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

async function callCreateTasks(unitOfWork, authToken, account, taskIds) {
    const tasks = await TaskServices.listById(unitOfWork, taskIds);

    const tasksRequest = tasks
        .map(task => ({
            task_id: task.id
            , title: task.title
            , description: task.description ? task.description : ""
            , created_at: task.createdAt.toISOString()
            , updated_at: task.updatedAt.toISOString()
            , owner_id: authToken.accountId
        }));

    const result = await TasksRPC.createTasks(unitOfWork, tasksRequest);
    if (result != undefined && 'ids' in result && result.ids.length == tasksRequest.length) {
        await TasksSyncServices.markSynched(unitOfWork, taskIds);
    } else if ('status' in result && result.status === '409') {
        await TasksSyncServices.markSynced(unitOfWork, taskIds);
    }
} 

async function callUpdateTasks(unitOfWork, taskIds) {
    const tasks = await TaskServices.listById(unitOfWork, taskIds);

    const tasksRequest = tasks
    .map(task => ({
        task_id: task.id
        , title: task.title
        , description: task.description ? task.description : ""
        , updated_at: task.updatedAt.toISOString()
    }));

    const result = await TasksRPC.updateTasks(unitOfWork, tasksRequest);
    if (result != undefined) {
        await TasksSyncServices.markSynced(unitOfWork, taskIds);
    }
}

async function callDeleteTasks(unitOfWork, taskIds) {
    const result = [];    

    for (const taskId of taskIds) {
        if (taskId != undefined) {
            try {
                await TasksRPC.deleteTasks(unitOfWork, taskId);
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

async function callListServerTasks(unitOfWork, account) {
    result = await TasksRPC.listTasks(unitOfWork, account.id);
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
    
    await RunUnitOfWork.run(async (unitOfWork) => {
        const authToken = await AuthServices.getActiveSession(unitOfWork);
        if (authToken == undefined) {
            Logger.info("Unable to run Synch Manager, no account logged in");
            return;
        }
        const account = await AccountServices.getAccountById(unitOfWork, authToken.accountId);

        // Created tasks in server

        const createdTasksSynch = await TasksSyncServices.getNonSynced(unitOfWork);
        const tasksToCreate = 
            createdTasksSynch
                .filter(task => task.synchStatus == TASK_SYNCH_STATUS.LOCAL)
                .map(taskSynch => taskSynch.taskId)
        if (tasksToCreate.length > 0) {
            await callCreateTasks(unitOfWork, authToken, account, tasksToCreate);
        }

        // Update tasks in server

        const tasksToUpdate =
            createdTasksSynch
                .filter(task => task.synchStatus == TASK_SYNCH_STATUS.DIRTY)
                .map(tasksSynch => tasksSynch.taskId);
        if (tasksToUpdate.length > 0) {
            await callUpdateTasks(unitOfWork, tasksToUpdate);
        }

        // Delete completed tasks from the server

        const completeTasksSynch = await TasksSyncServices.getComplete(unitOfWork);
        if (completeTasksSynch.length > 0) {
            const tasksToDelete = completeTasksSynch.map(task => task.taskId);
            const tasksSynchToDelete = await callDeleteTasks(unitOfWork, tasksToDelete);
            if (tasksSynchToDelete.length > 0) {
                await TasksSyncServices.deleteMultipleByTaskId(unitOfWork, tasksSynchToDelete);
            }
        }

        // Get Tasks from server

        const result = await callListServerTasks(unitOfWork, account);
        let tasksToInsert = undefined;
        if (result.length > 0) {
            const existingTasks = await TaskServices.list(unitOfWork, account.id);
            tasksToInsert = result
                    .filter(result => existingTasks.filter(entry => entry.id == result.task_id).length == 0)
                    .map(taskData => ({
                        id: taskData.task_id
                        , title: taskData.title
                        , createdAt: new Date() // FIXME: This should come from the server
                        , updatedAt: new Date() // FIXME: This should come from the server
                        , ownerId: authToken.accountId
                    }));
            await TaskServices.createMultiple(unitOfWork, tasksToInsert);
            tasksToInsert.forEach(entry => {
                TasksSyncServices.createSyncMonitor(unitOfWork, entry.id, TASK_SYNCH_STATUS['SYNCHED'])
            })

            // FIXME: Update only tasks that need updating
            result.map(entry => TaskServices.update(
                unitOfWork
                , {
                    id: entry.task_id
                    , title: entry.title
                    , createdAt: new Date() // FIXME: This should come from the server
                    , updatedAt: new Date() // FIXME: This should come from the server
                    , ownerId: entry.owner_id
                }))
            
            setTimeout(async () => {
                const refreshedTasks = await TaskServices.list(unitOfWork, account.id);
                eventHandler.send('tasks:refresh', refreshedTasks);
            }, 500);
        }

        const existingTasks = await TaskServices.list(unitOfWork, account.id);
        if (existingTasks.length != 0) { 
            let tasksWithSynchStatus = [];
            if (result.length > 0) {
                tasksWithSynchStatus = existingTasks
                    .map(async entry => {
                        const synchStatus = await TasksSyncServices.getSyncStatus(unitOfWork, entry.id);
                        return {
                            id: entry.id
                            , taskSynchStatus: synchStatus.synchStatus
                        };
                    });
            } else {
                tasksWithSynchStatus = existingTasks.map(async entry => {
                    const synchStatus = await TasksSyncServices.getSyncStatus(unitOfWork, entry.id);
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
                if (tasksToDelete.length > 0) {
                    await TaskServices.deleteMultiple(unitOfWork, tasksToDelete);
                    await TasksSyncServices.deleteMultipleByTaskId(unitOfWork, tasksToDelete);
                    
                    setTimeout(async () => {
                        const refreshedTasks = await TaskServices.list(unitOfWork, account.id);
                        eventHandler.send('tasks:refresh', refreshedTasks); 
                    }, 500);
                }
            });
        }
    });

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