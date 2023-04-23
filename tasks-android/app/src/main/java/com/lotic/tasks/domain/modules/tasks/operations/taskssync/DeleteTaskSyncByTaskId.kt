package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.modules.tasks.repositories.TasksSyncRepository
import com.lotic.tasks.domain.shared.Command
import java.util.UUID

class DeleteTaskSyncByTaskId(
    private val tasksSyncRepository: TasksSyncRepository) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        val taskSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(input)
        taskSyncEntry?.run { tasksSyncRepository.delete(this.id) }
    }

}