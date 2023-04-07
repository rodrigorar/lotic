package com.lotic.tasks.domain.modules.tasks.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

enum class SyncStatus {
    LOCAL
    , SYNCHED
    , DIRTY
    , COMPLETE
}

@Entity(tableName = "tasks_sync")
data class EntityTasksSync(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "task_id") val taskId: UUID
    , @ColumnInfo(name = "sync_status") val syncStatus: SyncStatus
    , @ColumnInfo(name = "created_at") val createdAt: String
    , @ColumnInfo(name = "updated_at") val updatedAt: String)
