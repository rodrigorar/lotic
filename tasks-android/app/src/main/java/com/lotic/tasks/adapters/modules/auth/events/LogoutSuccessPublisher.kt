package com.lotic.tasks.adapters.modules.auth.events

import com.lotic.tasks.domain.errors.DuplicateEntryException
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.events.Subscriber
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

object LogoutSuccessPublisher : Publisher<Id<Account>> {
    private val subscribers: MutableMap<UUID, Subscriber<Id<Account>>> = HashMap<UUID, Subscriber<Id<Account>>>().toMutableMap()

    override fun register(subscriber: Subscriber<Id<Account>>) {
        if (this.subscribers.containsKey(subscriber.key())) {
            throw DuplicateEntryException(
                "A subscriber already exists for " + subscriber.key().toString())
        }
        this.subscribers[subscriber.key()] = subscriber
    }

    override fun deregister(subscriber: Subscriber<Id<Account>>) {
        this.subscribers.remove(subscriber.key())
    }

    override suspend fun publish(event: Event<Id<Account>>) {
        this.subscribers.forEach { it.value.notify(event) }
    }
}