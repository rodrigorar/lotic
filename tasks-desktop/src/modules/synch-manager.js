const { AccountServices } = require("./accounts/services");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSynchServices } = require("./tasks_synch/services");
const { TasksSynchData, TASK_SYNCH_STATUS } = require("./tasks_synch/data");
const { Logger } = require("./shared/logger");
const { StatusCode } = require("./shared/http");

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

async function execute() {
    const createdTasksSynch = await TasksSynchServices.getNonSynched();

    // Created tasks in server

    const tasksToCreate = 
        createdTasksSynch
            .filter(task => task.synchStatus == TASK_SYNCH_STATUS.LOCAL)
            .map(taskSynch => taskSynch.taskId)
    if (tasksToCreate.length > 0) {

        const account = await AccountServices.getLoggedAccount();
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

    Logger.trace('Finished Task Synchornization');
    
} 

module.exports.SynchManager = {
    execute
}