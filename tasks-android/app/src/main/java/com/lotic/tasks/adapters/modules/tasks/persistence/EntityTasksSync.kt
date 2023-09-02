package com.lotic.tasks.adapters.modules.tasks.persistence

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import java.time.ZonedDateTime
import java.util.*

@Entity(tableName = "tasks_sync")
data class EntityTasksSync(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "task_id") val taskId: UUID
    , @ColumnInfo(name = "sync_status") val syncStatus: SyncStatus
    , @ColumnInfo(name = "created_at") val createdAt: String
    , @ColumnInfo(name = "updated_at") val updatedAt: String) {

    companion object {
        fun fromDomain(entity: TasksSync): EntityTasksSync {
            return EntityTasksSync(
                entity.id.value
                , entity.taskId.value
                , entity.syncStatus
                , entity.createdAt.toString()
                , entity.updatedAt.toString())
        }
    }

    fun toDomain(): TasksSync {
        return TasksSync(
            TasksSync.idOf(this.id)
            , Task.idOf(this.taskId)
            , this.syncStatus
            , ZonedDateTime.parse(this.createdAt)
            , ZonedDateTime.parse(this.updatedAt))
    }
}
