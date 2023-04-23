package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.SuspendedProvider

class ListTasks(
    private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
    , private val tasksRepository: TasksRepository) : SuspendedProvider<List<Task>> {

    override suspend fun get(): List<Task> {
        val activeUser: AuthToken? = this.currentActiveAuthSessionProvider.get();

        return if (activeUser != null) {
            this.tasksRepository.listTasksForAccount(activeUser.accountId)
        } else {
            emptyList()
        }
    }
}