const { Validators } = require("./utils/utils");

const EventType = {
    LOGIN_SUCCESS: "LoginSuccess"
    , REFRESH_SUCCESS: "RefreshSuccess"
    , REFRESH_FAILED: "RefreshFailed"
    , LOGOUT_SUCCESS: "LogoutSuccess"
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

    subscriberId() {
        return this.subscriberId;
    }
    
    notify(event) {
        this.notifyAction(event);
    }
}


class EventBus {

    constructor() {
        this.queueSubscribers = {
            [EventType.LOGIN_SUCCESS]: []
            , [EventType.REFRESH_SUCCESS]: []
            , [EventType.REFRESH_FAILED]: []
            , [EventType.LOGOUT_SUCCESS]: []
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
            .filter(entry => entry.subscriberId() == subscriber.subscriberId());
        
        if (matchingSubscribers.length > 0) {
            // TODO: Throw an error for duplicated subscriber
        } else {
            this.queueSubscribers[eventType].push(subscriber);
        }
    }

    unregister(eventType, subscriber) {
        Validators.isNotNull(eventType);
        Validators.isNotNull(subscriber);

        // TODO: Not implemented
    }

}

const eventBus = new EventBus();
Object.freeze(eventBus);


module.exports.EventType = EventType;
module.exports.Event = Event;
module.exports.EventSubscriber = EventSubscriber;
module.exports.EventBus = eventBus;