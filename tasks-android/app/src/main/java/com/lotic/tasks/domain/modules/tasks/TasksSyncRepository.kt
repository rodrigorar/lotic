package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.persistence.Repository
import java.util.*

interface TasksSyncRepository : Repository<UUID, TasksSync> {
    suspend fun updateMultiple(tasksSync: List<TasksSync>)
    suspend fun getByTaskId(taskId: UUID): TasksSync?
    suspend fun getByTaskIds(taskIds: List<UUID>): List<TasksSync>
    suspend fun getByStatus(status: SyncStatus): List<TasksSync>
}