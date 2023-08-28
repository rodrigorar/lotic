package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime
import java.util.*

class CreateLocalTasksSyncSubscriber(private val tasksSyncRepository: TasksSyncRepository) : Subscriber<List<UUID>>() {

    override fun notify(event: Event<List<UUID>>) {
        runBlocking {
            event.payload.forEach {
                tasksSyncRepository.insert(
                    TasksSync(
                        UUID.randomUUID(),
                        it,
                        SyncStatus.LOCAL,
                        ZonedDateTime.now(),
                        ZonedDateTime.now()
                    )
                )
            }
        }
    }
}