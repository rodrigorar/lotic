package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime
import java.util.*

class CompleteTasksSyncSubscriber(private val tasksSyncRepository: TasksSyncRepository) : Subscriber<UUID>() {

    override fun notify(event: Event<UUID>) {
        runBlocking {
            val currentTaskSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(event.payload)
            currentTaskSyncEntry?.run {
                tasksSyncRepository.update(
                    event.payload
                    , this.copy(syncStatus = SyncStatus.COMPLETE, updatedAt = ZonedDateTime.now()))
            }
        }
    }

}