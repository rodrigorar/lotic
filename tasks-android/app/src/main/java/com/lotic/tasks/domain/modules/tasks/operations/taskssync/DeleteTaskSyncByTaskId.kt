package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id

class DeleteTaskSyncByTaskId(
    private val tasksSyncRepository: TasksSyncRepository
) : Command<Id<Task>> {

    override suspend fun execute(input: Id<Task>) {
        val taskSyncEntry: TasksSync? = tasksSyncRepository.getByTaskId(input)
        taskSyncEntry?.run { tasksSyncRepository.delete(this.id) }
    }

}