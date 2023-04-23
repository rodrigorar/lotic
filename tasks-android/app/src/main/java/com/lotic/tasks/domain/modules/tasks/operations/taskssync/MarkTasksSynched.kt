package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.dtos.SyncStatus
import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.modules.tasks.repositories.TasksSyncRepository
import com.lotic.tasks.domain.shared.Command
import java.time.ZonedDateTime
import java.util.*

class MarkTasksSynced(
    private val tasksSyncRepository: TasksSyncRepository) : Command<List<UUID>> {

    override suspend fun execute(input: List<UUID>) {
        val updatedTasksSync: List<TasksSync> = this.tasksSyncRepository
            .getByTaskIds(input)
            .map { it.copy(syncStatus = SyncStatus.SYNCHED, updatedAt = ZonedDateTime.now()) }
        this.tasksSyncRepository.updateMultiple(updatedTasksSync)
    }

}