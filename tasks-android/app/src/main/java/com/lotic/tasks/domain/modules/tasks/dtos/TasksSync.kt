package com.lotic.tasks.domain.modules.tasks.dtos

import com.lotic.tasks.domain.modules.tasks.data.EntitySyncStatus
import com.lotic.tasks.domain.modules.tasks.data.EntityTasksSync
import com.lotic.tasks.domain.shared.FromEntity
import com.lotic.tasks.domain.shared.ToEntity
import java.time.ZonedDateTime
import java.util.*

enum class SyncStatus {
    LOCAL
    , SYNCHED
    , DIRTY
    , COMPLETE
}

data class TasksSync(
    val id: UUID
    , val taskId: UUID
    , val syncStatus: SyncStatus
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime) : ToEntity<EntityTasksSync> {

    companion object : FromEntity<TasksSync, EntityTasksSync> {

        override fun fromEntity(entity: EntityTasksSync): TasksSync {
            return TasksSync(
                entity.id
                , entity.taskId
                , SyncStatus.valueOf(entity.syncStatus.name)
                , ZonedDateTime.parse(entity.createdAt)
                , ZonedDateTime.parse(entity.updatedAt))
        }

    }

    override fun toEntity(): EntityTasksSync {
        return EntityTasksSync(
            this.id
            , this.taskId
            , EntitySyncStatus.valueOf(this.syncStatus.name)
            , this.createdAt.toString()
            , this.updatedAt.toString())
    }

}
