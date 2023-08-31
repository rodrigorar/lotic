package com.lotic.tasks.adapters.modules.tasks.events

import com.lotic.tasks.domain.errors.DuplicateEntryException
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.events.Subscriber
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

object TasksCompletedPublisher : Publisher<Id<Task>> {
    private val subscribers: MutableMap<UUID, Subscriber<Id<Task>>> = HashMap<UUID, Subscriber<Id<Task>>>().toMutableMap()

    override fun register(subscriber: Subscriber<Id<Task>>) {
        if (this.subscribers.containsKey(subscriber.key())) {
            throw DuplicateEntryException(
                "A subscriber already exists for " + subscriber.key().toString()
            )
        }
        this.subscribers[subscriber.key()] = subscriber
    }

    override fun deregister(subscriber: Subscriber<Id<Task>>) {
        this.subscribers.remove(subscriber.key())
    }

    override suspend fun publish(event: Event<Id<Task>>) {
        this.subscribers.forEach { it.value.notify(event) }
    }
}