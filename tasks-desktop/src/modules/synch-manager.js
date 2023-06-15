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
const { runStateMachine } = require("./sync/statemachine");
const { StartSyncState } = require("./sync/states");

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

async function callListServerTasks(unitOfWork, account) {
    result = await TasksRPC.listTasks(unitOfWork, account.id);
    return result.data.tasks.map(entry => ({
        task_id: entry.task_id
        , title: entry.title
        , description: entry.description
        , owner_id: entry.owner_id
    }));
}

async function doExecute(providedWebContents = undefined, isShutdown) {
    const eventHandler = 
        providedWebContents != undefined 
            ? providedWebContents 
            : webContents.getFocusedWebContents();

    await runStateMachine(new StartSyncState());

    Logger.trace('Finished Task Synchornization');
}

async function execute(providedWebContents = undefined, isShutdown = false) {
    try {
        await doExecute(providedWebContents, isShutdown);
    } catch (e) {
        Logger.error('Failed to properly synch with server');
        Logger.error(e);
    }
} 

module.exports.SynchManager = {
    execute
}