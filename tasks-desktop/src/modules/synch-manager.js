const { Logger } = require("./shared/logger");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");


async function execute() {
    const tasks = await TaskServices.list();
    TasksRPC.createTasks(tasks);

    // TODO: Get remote tasks and persist/merge them. 

    // TODO: Send local tasks to the server. 

    // TODO: Mark local tasks as synched.
} 

module.exports.SynchManager = {
    execute
}