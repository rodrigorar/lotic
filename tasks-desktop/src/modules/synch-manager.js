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
        TasksSynchServices.markSynched(taskIds);
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
        TasksSynchServices.markSynched(taskIds);
    }
}

async function execute() {
    const tasksSynch = await TasksSynchServices.getNonSynched();

    // Created tasks in server

    const tasksToCreate = 
        tasksSynch
            .filter(task => task.synchStatus == TasksSynchData.TASK_SYNCH_STATUS.LOCAL)
            .map(taskSynch => taskSynch.taskId)
    if (tasksToCreate.length > 0) {

        console.log('Just before calling create tasks');
         // TODO: This account id should come from the database
        await callCreateTasks('d02e1b3b-014c-47a9-ab73-fa2b3366088e', tasksToCreate);
    }

    // Update tasks in server

    const tasksToUpdate =
        tasksSynch
            .filter(task => task.synchStatus == TasksSynchData.TASK_SYNCH_STATUS.DIRTY)
            .map(tasksSynch => tasksSynch.taskId);
    if (tasksToUpdate.length > 0) {
        await callUpdateTasks(tasksToUpdate);
    }

    // TODO: Delete tasks in server

    // TODO: Delete completed tasks from the server
    
} 

module.exports.SynchManager = {
    execute
}