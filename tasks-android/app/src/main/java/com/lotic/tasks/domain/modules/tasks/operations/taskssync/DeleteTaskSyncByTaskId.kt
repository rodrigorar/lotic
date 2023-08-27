package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.operations.Command
import java.util.UUID

class DeleteTaskSyncByTaskId(
    private val tasksSyncRepository: TasksSyncRepository
) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        val taskSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(input)
        taskSyncEntry?.run { tasksSyncRepository.delete(this.id) }
    }

}