package com.lotic.tasks.adapters.modules.tasks.events

import com.lotic.tasks.domain.errors.DuplicateEntryException
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.events.Subscriber
import java.util.*

object TasksCreatedPublisher : Publisher<List<UUID>> {
    private val subscribers: MutableMap<UUID, Subscriber<List<UUID>>> = HashMap<UUID, Subscriber<List<UUID>>>().toMutableMap()

    override fun register(subscriber: Subscriber<List<UUID>>) {
        if (this.subscribers.containsKey(subscriber.key())) {
            throw DuplicateEntryException(
                "A subscriber already exists for " + subscriber.key().toString()
            )
        }
        this.subscribers[subscriber.key()] = subscriber
    }

    override fun deregister(subscriber: Subscriber<List<UUID>>) {
        this.subscribers.remove(subscriber.key())
    }

    override suspend fun publish(event: Event<List<UUID>>) {
        this.subscribers.forEach { it.value.notify(event) }
    }
}