package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.SuspendedProvider

class GetCompleteTasksSync(
    private val tasksSyncRepository: TasksSyncRepository
) : SuspendedProvider<List<TasksSync>> {

    override suspend fun get(): List<TasksSync> {
        return this.tasksSyncRepository.getByStatus(SyncStatus.COMPLETE)
    }

}