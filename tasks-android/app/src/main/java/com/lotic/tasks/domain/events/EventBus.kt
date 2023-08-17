package com.lotic.tasks.domain.events

object EventBus {
    private val observers: MutableMap<EventType, MutableList<EventObserver>> = mutableMapOf()

    init {
        for (type in EventType.values()) {
            observers[type] = mutableListOf()
        }
    }

    fun post(event: Event) {
        synchronized(this) {
            observers[event.type]?.forEach { it.notify(event) }
        }
    }

    fun subscribe(eventType: EventType, observer: EventObserver) {
        synchronized(this) {
            // TODO: We should make sure that we don't have the same observer twice
            // for the same event type
            this.observers[eventType]?.add(observer)
        }
    }

    fun subscribe(eventTypes: List<EventType>, observer: EventObserver) {
        synchronized(this) {
            eventTypes.forEach {
                this.observers[it]?.add(observer)
            }
        }
    }

    fun clear() {
        synchronized(this) {
            observers.clear()
        }
    }
}