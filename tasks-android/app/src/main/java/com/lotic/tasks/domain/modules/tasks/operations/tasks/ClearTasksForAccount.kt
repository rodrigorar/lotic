package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.Command
import java.util.*

class ClearTasksForAccount(private val tasksRepository: TasksRepository) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        val taskList: List<Task> = this.tasksRepository.listTasksForAccount(input)
        if (taskList.isNotEmpty()) {
            this.tasksRepository.deleteMultiple(taskList.map { it.id })
        }
    }

}