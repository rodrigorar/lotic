package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime
import java.util.*

class UpdateTasksSyncSubscriber(private val tasksSyncRepository: TasksSyncRepository) : Subscriber<UUID>() {

    override fun notify(event: Event<UUID>) {
        runBlocking {
            val currentTasksSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(event.payload)

            currentTasksSyncEntry?.run {
                if (this.syncStatus != SyncStatus.LOCAL) {
                    tasksSyncRepository.update(
                        this.id,
                        this.copy(
                            syncStatus = SyncStatus.DIRTY,
                            updatedAt = ZonedDateTime.now()
                        )
                    )
                }
            }
        }
    }
}