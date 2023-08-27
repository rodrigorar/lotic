package com.lotic.tasks.domain.shared.events

import java.util.*

abstract class Subscriber<T> {
    protected val key: UUID = UUID.randomUUID()

    fun key(): UUID {
        return key
    }

    abstract fun notify(event: Event<T>)
}