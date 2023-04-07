package com.lotic.tasks.domain.modules.tasks

import android.content.Context
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.operations.ClearTasksForAccount
import com.lotic.tasks.domain.modules.tasks.operations.CreateTasks
import com.lotic.tasks.domain.modules.tasks.operations.ListTasks
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.persistence.TasksDatabase
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object TasksOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var tasksRepository: TasksRepository
    private lateinit var authOperationsProvider: AuthOperationsProvider

    override fun setContextProvider(contextProvider: Provider<Context>): TasksOperationsProvider {
        this.contextProvider = contextProvider
        return this;
    }

    fun setAuthOperationsProvider(authOperationsProvider: AuthOperationsProvider): TasksOperationsProvider {
        this.authOperationsProvider = authOperationsProvider
        return this
    }

    fun init(): TasksOperationsProvider {
        tasksRepository = TasksRepository(
            TasksDatabase.getDatabase(
                contextProvider.get()).daoTasks())
        return this
    }

    fun listTasks(): ListTasks {
        return ListTasks(
            this.authOperationsProvider.currentActiveAuthSessionProvider()
            , this.tasksRepository)
    }

    fun createTasks(): CreateTasks {
        return CreateTasks(this.tasksRepository)
    }

    fun clearTasksForAccount(): ClearTasksForAccount {
        return ClearTasksForAccount(this.tasksRepository)
    }
}
