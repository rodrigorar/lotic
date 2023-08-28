package com.lotic.tasks.adapters.modules.tasks

import android.content.Context
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.events.TasksCompletedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedSyncedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksUpdatedPublisher
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.modules.tasks.operations.tasks.ClearTasksForAccount
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CompleteTask
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CreateTask
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CreateTasks
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CreateTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.tasks.GetTasksById
import com.lotic.tasks.domain.modules.tasks.operations.tasks.ListTasks
import com.lotic.tasks.domain.modules.tasks.operations.tasks.UpdateTask
import com.lotic.tasks.domain.modules.tasks.operations.tasks.UpdateTasksSynced
import com.lotic.tasks.domain.shared.operations.OperationsProvider
import com.lotic.tasks.domain.shared.operations.Provider

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

    fun init(tasksRepository: TasksRepository): TasksOperationsProvider {
        TasksOperationsProvider.tasksRepository = tasksRepository
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
            tasksRepository
            , authOperationsProvider.currentActiveAuthSessionProvider())
    }

    fun createTask(): CreateTask {
        return CreateTask(tasksRepository, TasksCreatedPublisher)
    }

    fun createTasks(): CreateTasks {
        return CreateTasks(tasksRepository, TasksCreatedPublisher)
    }

    fun createTasksSynced(): CreateTasksSynced {
        return CreateTasksSynced(tasksRepository, TasksCreatedSyncedPublisher)
    }

    fun updateTask(): UpdateTask {
        return UpdateTask(tasksRepository, TasksUpdatedPublisher)
    }

    fun updateTaskSynced(): UpdateTasksSynced {
        return UpdateTasksSynced(tasksRepository)
    }

    fun completeTasks(): CompleteTask {
        return CompleteTask(tasksRepository, TasksCompletedPublisher)
    }

    fun clearTasksForAccount(): ClearTasksForAccount {
        return ClearTasksForAccount(tasksRepository)
    }
}
