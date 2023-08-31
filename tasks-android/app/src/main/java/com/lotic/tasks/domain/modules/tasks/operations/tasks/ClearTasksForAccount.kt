package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id

class ClearTasksForAccount(private val tasksRepository: TasksRepository) : Command<Id<Account>> {

    override suspend fun execute(input: Id<Account>) {
        val taskList: List<Task> = this.tasksRepository.listTasksForAccount(input)
        if (taskList.isNotEmpty()) {
            this.tasksRepository.deleteMultiple(taskList.map { it.id })
        }
    }

}