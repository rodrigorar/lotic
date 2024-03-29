package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber
import com.lotic.tasks.domain.shared.value_objects.Id
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime

class UpdateTasksSyncSubscriber(private val tasksSyncRepository: TasksSyncRepository) : Subscriber<Id<Task>>() {

    override fun notify(event: Event<Id<Task>>) {
        runBlocking {
            val currentTasksSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(event.payload)

            currentTasksSyncEntry?.run {
                if (this.syncStatus != SyncStatus.LOCAL) {
                    tasksSyncRepository.update(
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