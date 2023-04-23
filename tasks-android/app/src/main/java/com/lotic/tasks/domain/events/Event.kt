package com.lotic.tasks.domain.events

data class Event(val type: EventType) {
    lateinit var eventInfo: EventInfo
        private set

    constructor(type: EventType, eventInfo: EventInfo) : this(type) {
        this.eventInfo = eventInfo
    }

    fun isOfType(type: EventType): Boolean {
        return type == this.type
    }

    fun hasPayload(): Boolean {
        return this::eventInfo.isInitialized
    }
}