package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.persistence.Repository
import java.util.*

interface TasksRepository : Repository<UUID, Task> {
    suspend fun insertMultiple(entities: List<Task>)
    suspend fun listTasksForAccount(accountId: UUID): List<Task>
    suspend fun getTasksById(accountId: UUID, taskIds: List<UUID>): List<Task>
    suspend fun deleteMultiple(taskIds: List<UUID>)
}