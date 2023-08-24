package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TaskCompletedEventInfo
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime

class CompleteTasksSync(
    private val tasksSyncRepository: TasksSyncRepository
) : EventObserver {

    override fun notify(event: Event) {
        if (event.isOfType(EventType.TASKS_COMPLETED)) {
            runBlocking {
                val eventInfo: TaskCompletedEventInfo = event.eventInfo as TaskCompletedEventInfo
                val currentTaskSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(eventInfo.taskId)
                currentTaskSyncEntry?.run {
                    tasksSyncRepository.update(
                        eventInfo.taskId
                        , this.copy(syncStatus = SyncStatus.COMPLETE, updatedAt = ZonedDateTime.now()))
                }
            }
        }
    }

}