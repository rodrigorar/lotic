package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.shared.Repository
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

interface TasksSyncRepository : Repository<Id<TasksSync>, TasksSync> {
    suspend fun updateMultiple(tasksSync: List<TasksSync>)
    suspend fun getByTaskId(taskId: Id<Task>): TasksSync?
    suspend fun getByTaskIds(taskIds: List<Id<Task>>): List<TasksSync>
    suspend fun getByStatus(status: SyncStatus): List<TasksSync>
}