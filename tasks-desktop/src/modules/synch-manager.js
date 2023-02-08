const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");
const { TasksSynchServices } = require("./tasks_synch/services");
const { TasksSynchData } = require("./tasks_synch/data");

async function execute() {
    const tasksSynch = await TasksSynchServices.getNonSynched();
    console.log("Tasks Synch: " + tasksSynch.length);
    const tasks = await TaskServices.listById(tasksSynch
        .filter(task => task.synchStatus == TasksSynchData.TASK_SYNCH_STATUS.LOCAL).map(taskSynch => taskSynch.taskId));
    console.log("Tasks: " + tasks.length);
    const tasksRequest = tasks
        .map(task => ({
            task_id: task.id
            , title: task.title
            , description: task.description ? task.description : ""
            , created_at: task.createdAt.toISOString()
            , updated_at: task.updatedAt.toISOString()
            , owner_id: 'd02e1b3b-014c-47a9-ab73-fa2b3366088e' // TODO: This account id should come from the database
        }));

    const result = await TasksRPC.createTasks(tasksRequest);
    console.log('After server call');
    console.log(result);
    if (result != undefined && result.ids.length == tasksRequest.length) {
        console.log('Marking everything as synched');
        TasksSynchServices.markSynched(tasks.map(task => task.id));
    }

    // TODO: Update tasks to the server

    // TODO: Delete completed tasks from the server
    
    // TODO: This account id should come from the database, and should
    // be created when the user creates the app
    /*
    const serverTasks = TasksRPC.listTasks('d02e1b3b-014c-47a9-ab73-fa2b3366088e');

    // Delete tasks that disappeared from the server
    const serverTaskIds = serverTasks.map(taskData => taskData.id);
    const clientTaskIds = tasks.map(task => task.id);
    TaskServices.eraseMultiple(clientTaskIds.filter(id => ! serverTaskIds.includes(id)))
    */

    // TODO: Send local tasks to the server. 

    // TODO: Mark local tasks as synched.
} 

module.exports.SynchManager = {
    execute
}