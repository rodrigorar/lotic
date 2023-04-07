package com.lotic.tasks.domain.events

data class Event(val type: EventType) {

    fun isOfType(type: EventType): Boolean {
        return type == this.type
    }
}