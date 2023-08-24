package com.lotic.tasks.domain.modules.tasks.events

import android.util.Log
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TaskUpdatedEventInfo
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime

class UpdateTasksSync(
    private val tasksSyncRepository: TasksSyncRepository
) : EventObserver {

    override fun notify(event: Event) {
        if (event.isOfType(EventType.TASKS_UPDATED)) {
            val eventInfo: TaskUpdatedEventInfo = event.eventInfo as TaskUpdatedEventInfo
            runBlocking {
                val currentTasksSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(eventInfo.taskId)
                currentTasksSyncEntry?.run {
                    Log.d("UpdateTasksSync", "Updating tasks sync info")
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

}