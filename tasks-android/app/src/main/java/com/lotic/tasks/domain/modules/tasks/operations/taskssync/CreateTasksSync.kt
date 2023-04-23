package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import android.util.Log
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TaskCreatedEventInfo
import com.lotic.tasks.domain.events.payloads.TasksSyncedEventInfo
import com.lotic.tasks.domain.modules.tasks.dtos.SyncStatus
import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.modules.tasks.repositories.TasksSyncRepository
import kotlinx.coroutines.runBlocking
import java.time.ZonedDateTime
import java.util.UUID

class CreateTasksSync(private val tasksSyncRepository: TasksSyncRepository) : EventObserver {

    override fun notify(event: Event) {
        if (event.isOfType(EventType.TASKS_CREATED)) {
            val eventInfo: TaskCreatedEventInfo = event.eventInfo as TaskCreatedEventInfo

            runBlocking {
                Log.d("CreateTasksSync", "Create a Task Sync entry")
                tasksSyncRepository.insert(
                    TasksSync(
                        UUID.randomUUID()
                        , eventInfo.taskId
                        , SyncStatus.LOCAL
                        , ZonedDateTime.now()
                        , ZonedDateTime.now()))
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

