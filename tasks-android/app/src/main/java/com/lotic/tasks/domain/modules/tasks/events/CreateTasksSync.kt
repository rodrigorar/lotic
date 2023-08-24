package com.lotic.tasks.domain.modules.tasks.events

import android.util.Log
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TasksCreatedEventInfo
import com.lotic.tasks.domain.events.payloads.TasksCreatedSyncedEventInfo
import com.lotic.tasks.domain.events.payloads.TasksSyncedEventInfo
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime
import java.util.UUID

class CreateTasksSync(private val tasksSyncRepository: TasksSyncRepository) : EventObserver {

    override fun notify(event: Event) {
        if (event.isOfType(EventType.TASKS_CREATED)) {
            val eventInfo: TasksCreatedEventInfo = event.eventInfo as TasksCreatedEventInfo

            runBlocking {
                Log.d("CreateTasksSync", "Create a Task Sync entry")
                eventInfo.taskIds.forEach {
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
        } else if (event.isOfType(EventType.TASKS_CREATED_SYNCED)) {
            val eventInfo: TasksCreatedSyncedEventInfo = event.eventInfo as TasksCreatedSyncedEventInfo

            runBlocking {
                eventInfo.taskIds.forEach {
                    tasksSyncRepository.insert(
                        TasksSync(
                            UUID.randomUUID(),
                            it,
                            SyncStatus.SYNCHED,
                            ZonedDateTime.now(),
                            ZonedDateTime.now()
                        )
                    )
                }
            }
        } else if (event.isOfType(EventType.SYNC_SUCCESS)) {
            val eventInfo: TasksSyncedEventInfo = event.eventInfo as TasksSyncedEventInfo

            runBlocking {
                Log.d("CreateTasksSync", "Create a Task Sync entry after sync manager")
                eventInfo.createdTaskIds.forEach {
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
}

