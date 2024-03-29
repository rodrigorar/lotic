package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.SuspendedProvider

class ListTasks(
    private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
    , private val tasksRepository: TasksRepository
) : SuspendedProvider<List<Task>> {

    override suspend fun get(): List<Task> {
        val activeUser: AuthToken? = this.currentActiveAuthSessionProvider.get();

        return if (activeUser != null) {
            this.tasksRepository
                .listTasksForAccount(activeUser.accountId)
                .sortedBy { it.position.value }
        } else {
            emptyList()
        }
    }
}