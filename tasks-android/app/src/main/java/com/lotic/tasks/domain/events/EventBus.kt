package com.lotic.tasks.domain.events

import android.util.Log

object EventBus {
    private val observers: MutableMap<EventType, MutableList<EventObserver>> = mutableMapOf()

    init {
        for (type in EventType.values()) {
            observers[type] = mutableListOf()
        }
    }

    fun post(event: Event) {
        synchronized(this) {
            Log.d("EventBus", "Posting Event")
            observers[event.type]?.forEach { it.notify(event) }
        }
    }

    fun subscribe(eventType: EventType, observer: EventObserver) {
        synchronized(this) {
            // TODO: We should make sure that we don't have the same observer twice
            // for the same event type
            observers[eventType]?.add(observer)
        }
    }
}