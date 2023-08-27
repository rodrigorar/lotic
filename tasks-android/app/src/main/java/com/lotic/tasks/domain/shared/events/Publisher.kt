package com.lotic.tasks.domain.shared.events

interface Publisher<T> {
    fun register(subscriber: Subscriber<T>)
    fun deregister(subscriber: Subscriber<T>)
    suspend fun publish(event: Event<T>)
}