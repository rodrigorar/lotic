const { Logger } = require("../shared/logging/logger");
const { webContents } = require("electron");
const { runStateMachine } = require("./sync/statemachine");
const { StartSyncState } = require("./sync/states");
const { EventBus, EventType, Event } = require("../shared/event-bus");

async function doExecute(providedWebContents = undefined, isShutdown) {
    const eventHandler = 
        providedWebContents != undefined 
            ? providedWebContents 
            : webContents.getFocusedWebContents();

    EventBus.publish(new Event(EventType.SYNC_STARTED, {}));
    await runStateMachine(new StartSyncState());
    EventBus.publish(new Event(EventType.SYNC_ENDED, {}));

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