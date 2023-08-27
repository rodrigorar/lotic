package com.lotic.tasks.adapters.modules.auth.events

import com.lotic.tasks.domain.errors.DuplicateEntryException
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.events.Subscriber
import java.util.*

object LoginSuccessPublisher : Publisher<AuthToken> {
    private val subscribers: MutableMap<UUID, Subscriber<AuthToken>> = HashMap<UUID, Subscriber<AuthToken>>().toMutableMap()

    override suspend fun publish(event: Event<AuthToken>) {
        this.subscribers.forEach { it.value.notify(event) }
    }

    override fun register(subscriber: Subscriber<AuthToken>) {
        if (subscribers.containsKey(subscriber.key())) {
            throw DuplicateEntryException(
                "A subscriber already exists for " + subscriber.key().toString()
            )
        }
        this.subscribers[subscriber.key()] = subscriber
    }

    override fun deregister(subscriber: Subscriber<AuthToken>) {
        this.subscribers.remove(subscriber.key())
    }
}