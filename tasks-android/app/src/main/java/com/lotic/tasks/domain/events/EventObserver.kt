package com.lotic.tasks.domain.events

fun interface EventObserver {
    fun notify(event: Event)
}