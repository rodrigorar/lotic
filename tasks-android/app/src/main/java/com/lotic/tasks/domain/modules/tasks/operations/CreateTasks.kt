package com.lotic.tasks.domain.modules.tasks.operations

import android.util.Log
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Command

class CreateTasks(private val tasksRepository: TasksRepository) : Command<List<Task>> {

    override suspend fun execute(input: List<Task>) {
        Log.d("CreateTasks", "Persisting received tasks")
        this.tasksRepository.insertMultiple(input)
    }

}