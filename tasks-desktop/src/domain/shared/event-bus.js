const { Validators } = require("./utils");

const EventType = {
    LOGIN_SUCCESS: "LoginSuccess"
    , REFRESH_SUCCESS: "RefreshSuccess"
    , REFRESH_FAILED: "RefreshFailed"
    , LOGOUT_SUCCESS: "LogoutSuccess"
    , NEW_TASK_INFO: "NewTaskInfo"
    , CREATED_LOCAL_TASKS: "CreatedLocalTasks"
    , DELETED_LOCAL_TASKS: "DeletedLocalTasks"
    , SYNC_STARTED: "SyncStarted"
    , SYNC_ENDED: "SyncEnded"
}

class Event {

    constructor(eventType, body) {
        this.eventType = eventType;
        this.body = body;
    }

    body() {
        return this.body;
    }

    type() {
        return this.eventType;
    }
}

class EventSubscriber {

    constructor(subscriberId, notifyAction) {
        this.subscriberId = subscriberId;
        this.notifyAction = notifyAction;
    }

    notify(event) {
        this.notifyAction(event);
    }
}


class EventBus {

    constructor() {
        this.queueSubscribers = {};
        for (let key of Object.keys(EventType)) {
            this.queueSubscribers[EventType[key]] = [];
        }
    }

    publish(event) {
        Validators.isNotNull(event);

        const subscribers = this.queueSubscribers[event.type()];
        subscribers.forEach(subscriber => subscriber.notify(event));
    }

    register(eventType, subscriber) {
        Validators.isNotNull(eventType);
        Validators.isNotNull(subscriber);

        const matchingSubscribers = this.queueSubscribers[eventType]
            .filter(entry => entry.subscriberId == subscriber.subscriberId);
        
        if (matchingSubscribers.length > 0) {
            // TODO: Throw an error for duplicated subscriber
        } else {
            this.queueSubscribers[eventType].push(subscriber);
        }
    }

    registerForSeveralEventTypes(eventTypes, subscriber) {
        Validators.isNotNull(eventTypes);
        Validators.isNotNull(subscriber);

        eventTypes.forEach(eventType => this.register(eventType, subscriber));
    }

    unregister(eventType, subscriberId) {
        Validators.isNotNull(eventType);
        Validators.isNotNull(subscriberId);

        const matchingSubscriber = this.queueSubscribers[eventType]
            .filter(entry => entry.subscriberId == subscriberId);
        this.queueSubscribers[eventType].splice(this.queueSubscribers[eventType].indexOf(matchingSubscriber), 1);
    }

}

const eventBus = new EventBus();
Object.freeze(eventBus);


module.exports.EventType = EventType;
module.exports.Event = Event;
module.exports.EventSubscriber = EventSubscriber;
module.exports.EventBus = eventBus;