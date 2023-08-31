package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.Repository
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

interface TasksRepository : Repository<Id<Task>, Task> {
    suspend fun insertMultiple(entities: List<Task>)
    suspend fun listTasksForAccount(accountId: Id<Account>): List<Task>
    suspend fun getTasksById(accountId: UUID, taskIds: List<Id<Task>>): List<Task>
    suspend fun deleteMultiple(taskIds: List<Id<Task>>)
}