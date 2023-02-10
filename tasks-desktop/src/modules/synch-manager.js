const { AccountServices } = require("./accounts/services");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSynchServices } = require("./tasks_synch/services");
const { TasksSynchData } = require("./tasks_synch/data");

async function callCreateTasks(account_id, taskIds) {
    const tasks = await TaskServices.listById(taskIds);

    const tasksRequest = tasks
        .map(task => ({
            task_id: task.id
            , title: task.title
            , description: task.description ? task.description : ""
            , created_at: task.createdAt.toISOString()
            , updated_at: task.updatedAt.toISOString()
            , owner_id: account_id
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

async function execute() {
    const createdTasksSynch = await TasksSynchServices.getNonSynched();

    // Created tasks in server

    const tasksToCreate = 
        createdTasksSynch
            .filter(task => task.synchStatus == TasksSynchData.TASK_SYNCH_STATUS.LOCAL)
            .map(taskSynch => taskSynch.taskId)
    if (tasksToCreate.length > 0) {

        const account = await AccountServices.getLoggedAccount();
        await callCreateTasks(account.email, tasksToCreate);
    }

    // Update tasks in server

    const tasksToUpdate =
        createdTasksSynch
            .filter(task => task.synchStatus == TasksSynchData.TASK_SYNCH_STATUS.DIRTY)
            .map(tasksSynch => tasksSynch.taskId);
    if (tasksToUpdate.length > 0) {
        await callUpdateTasks(tasksToUpdate);
    }

    // Delete completed tasks from the server

    const completeTasksSynch = await TasksSynchServices.getComplete();
    if (completeTasksSynch.length > 0) {
        const tasksToDelete = tasksToDelete.map(task => task.task_id);
        const success = await callDeleteTasks(tasksToDeleteIds);
        if (success) {
            // TODO: Delete task synch entries
            await TaskServices.deleteMultiple(tasksToDelete)
        }
    }
    
} 

module.exports.SynchManager = {
    execute
}