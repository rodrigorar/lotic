package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id
import java.time.ZonedDateTime

class MarkTasksSynced(
    private val tasksSyncRepository: TasksSyncRepository
) : Command<List<Id<Task>>> {

    override suspend fun execute(input: List<Id<Task>>) {
        val updatedTasksSync: List<TasksSync> = this.tasksSyncRepository
            .getByTaskIds(input)
            .map { it.copy(syncStatus = SyncStatus.SYNCHED, updatedAt = ZonedDateTime.now()) }
        if (updatedTasksSync.isNotEmpty()) {
            this.tasksSyncRepository.updateMultiple(updatedTasksSync)
        }
    }

}