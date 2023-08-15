package com.lotic.tasks.domain.modules.tasks.operations.tasks

import android.content.Context
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.adapters.TasksDatabase
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object TasksOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var tasksRepository: TasksRepository
    private lateinit var authOperationsProvider: AuthOperationsProvider

    override fun setContextProvider(contextProvider: Provider<Context>): TasksOperationsProvider {
        TasksOperationsProvider.contextProvider = contextProvider
        return this;
    }

    fun setAuthOperationsProvider(authOperationsProvider: AuthOperationsProvider): TasksOperationsProvider {
        TasksOperationsProvider.authOperationsProvider = authOperationsProvider
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
            authOperationsProvider.currentActiveAuthSessionProvider()
            , tasksRepository
        )
    }

    fun getTasksById(): GetTasksById {
        return GetTasksById(
            this.tasksRepository
            , this.authOperationsProvider.currentActiveAuthSessionProvider())
    }

    fun createTask(): CreateTask {
        return CreateTask(tasksRepository)
    }

    fun createTasks(): CreateTasks {
        return CreateTasks(tasksRepository)
    }

    fun createTasksSynced(): CreateTasksSynced {
        return CreateTasksSynced(tasksRepository)
    }

    fun updateTask(): UpdateTask {
        return UpdateTask(tasksRepository)
    }

    fun updateTaskSynced(): UpdateTasksSynced {
        return UpdateTasksSynced(this.tasksRepository)
    }

    fun completeTasks(): CompleteTask {
        return CompleteTask(tasksRepository)
    }

    fun clearTasksForAccount(): ClearTasksForAccount {
        return ClearTasksForAccount(tasksRepository)
    }
}
