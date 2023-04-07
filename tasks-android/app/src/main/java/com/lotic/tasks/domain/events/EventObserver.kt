package com.lotic.tasks.domain.events

interface EventObserver {
    fun notify(event: Event)
}