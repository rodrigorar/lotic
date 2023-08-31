package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.EntitySyncStatus
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTasksSync
import com.lotic.tasks.domain.shared.mappers.FromEntity
import com.lotic.tasks.domain.shared.mappers.ToEntity
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
    , val updatedAt: ZonedDateTime) : ToEntity<EntityTasksSync> {

    companion object : FromEntity<TasksSync, EntityTasksSync> {

        // FIXME: Move this to the Persistence Entity (EntityTasksSync)
        override fun fromEntity(entity: EntityTasksSync): TasksSync {
            return TasksSync(
                idOf(entity.id)
                , Task.idOf(entity.taskId)
                , SyncStatus.valueOf(entity.syncStatus.name)
                , ZonedDateTime.parse(entity.createdAt)
                , ZonedDateTime.parse(entity.updatedAt))
        }

        fun idOf(value: UUID): Id<TasksSync> {
            return Id(value)
        }

        fun newId(): Id<TasksSync> {
            return Id(UUID.randomUUID())
        }
    }

    // FIXME: Move this to the Persistence Entity (EntityTasksSync)
    override fun toEntity(): EntityTasksSync {
        return EntityTasksSync(
            this.id.value
            , this.taskId.value
            , EntitySyncStatus.valueOf(this.syncStatus.name)
            , this.createdAt.toString()
            , this.updatedAt.toString())
    }

}
