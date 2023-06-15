const { TasksRPC } = require("./tasks/rpc");
const { Logger } = require("../shared/logging/logger");
const { webContents } = require("electron");
const { runStateMachine } = require("./sync/statemachine");
const { StartSyncState } = require("./sync/states");

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