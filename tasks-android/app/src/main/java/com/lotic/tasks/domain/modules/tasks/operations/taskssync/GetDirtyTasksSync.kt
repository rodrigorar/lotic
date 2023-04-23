package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.dtos.SyncStatus
import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.modules.tasks.repositories.TasksSyncRepository
import com.lotic.tasks.domain.shared.SuspendedProvider

class GetDirtyTasksSync(
    private val tasksSyncRepository: TasksSyncRepository) : SuspendedProvider<List<TasksSync>> {

    override suspend fun get(): List<TasksSync> {
        return this.tasksSyncRepository.getByStatus(SyncStatus.DIRTY)
    }

}