package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Query
import java.util.*

class GetTasksById(
    private val tasksRepository: TasksRepository
    , private val authSessionProvider: CurrentActiveAuthSessionProvider) : Query<List<UUID>, List<Task>> {

    override suspend fun execute(parameter: List<UUID>): List<Task> {
        val authSession: AuthToken? = authSessionProvider.get()
        return authSession?.let {
            this.tasksRepository.getTasksById(it.accountId, parameter)
        }.orEmpty()
    }

}