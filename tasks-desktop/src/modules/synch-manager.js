const { Logger } = require("../handlers/logging");
const { TasksRPC } = require("./tasks/rpc");
const { TaskServices } = require("./tasks/services");


async function execute() {
    Logger.trace('Running Synch Manager...');

    const tasks = await TaskServices.list();
    TasksRPC.createTasks(tasks);

    // TODO: Get remote tasks and persist/merge them. 

    // TODO: Send local tasks to the server. 

    // TODO: Mark local tasks as synched.
} 

module.exports.SynchManager = {
    execute
}