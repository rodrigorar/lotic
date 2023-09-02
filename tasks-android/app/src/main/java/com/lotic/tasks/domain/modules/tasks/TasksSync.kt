package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.shared.value_objects.Id
import java.time.ZonedDateTime
import java.util.*

enum class SyncStatus {
    LOCAL
    , SYNCHED
    , DIRTY
    , COMPLETE
}

data class TasksSync(
    val id: Id<TasksSync>
    , val taskId: Id<Task>
    , val syncStatus: SyncStatus
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime) {

    companion object {

        fun idOf(value: UUID): Id<TasksSync> {
            return Id(value)
        }

        fun newId(): Id<TasksSync> {
            return Id(UUID.randomUUID())
        }
    }
}
