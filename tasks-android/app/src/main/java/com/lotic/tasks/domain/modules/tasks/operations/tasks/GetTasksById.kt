package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.Query
import com.lotic.tasks.domain.shared.value_objects.Id

class GetTasksById(
    private val tasksRepository: TasksRepository
    , private val authSessionProvider: CurrentActiveAuthSessionProvider) :
    Query<List<Id<Task>>, List<Task>> {

    override suspend fun execute(parameter: List<Id<Task>>): List<Task> {
        val authSession: AuthToken? = authSessionProvider.get()
        return authSession?.let { authToken ->
            this.tasksRepository
                .getTasksById(authToken.accountId.value, parameter)
                .sortedBy { it.position.value }
        }.orEmpty()
    }

}