const { Logger } = require("../../../domain/shared/logger");
const { runStateMachine } = require("../../../domain/modules/sync/statemachine");
const { StartSyncState } = require("./states");
const { EventBus, EventType, Event } = require("../../../domain/shared/event-bus");

async function execute() {
    try {
        EventBus.publish(new Event(EventType.SYNC_STARTED, {}));
        await runStateMachine(new StartSyncState());
        EventBus.publish(new Event(EventType.SYNC_ENDED, {}));

        Logger.trace('Finished Task Synchornization');
    } catch (e) {
        Logger.error('Failed to properly synch with server');
        console.log(e);
    }
} 

module.exports.SynchManager = {
    execute
}