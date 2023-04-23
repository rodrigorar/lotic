package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Command
import java.util.*

class ClearTasksForAccount(private val tasksRepository: TasksRepository) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        val taskList: List<Task> = this.tasksRepository.listTasksForAccount(input)
        this.tasksRepository.deleteMultiple(taskList.map { it.id })
    }

}