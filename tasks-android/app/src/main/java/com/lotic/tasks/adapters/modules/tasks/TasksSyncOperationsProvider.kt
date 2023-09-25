package com.lotic.tasks.adapters.modules.tasks

import android.content.Context
import com.lotic.tasks.adapters.modules.tasks.events.TasksCompletedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedSyncedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksSyncSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksUpdatedPublisher
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.modules.tasks.events.CompleteTasksSyncSubscriber
import com.lotic.tasks.domain.modules.tasks.events.CreateLocalTasksSyncSubscriber
import com.lotic.tasks.domain.modules.tasks.events.CreateSyncedTasksSyncSubscriber
import com.lotic.tasks.domain.modules.tasks.events.SignInSuccessSubscriber
import com.lotic.tasks.domain.modules.tasks.events.UpdateTasksSyncSubscriber
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.DeleteTaskSyncByTaskId
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetCompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetDirtyTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetLocalTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.MarkTasksSynced
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.OperationsProvider
import com.lotic.tasks.domain.shared.operations.Provider

object TasksSyncOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var tasksSyncRepository: TasksSyncRepository

    override fun setContextProvider(contextProvider: Provider<Context>): TasksSyncOperationsProvider {
        TasksSyncOperationsProvider.contextProvider = contextProvider
        return this
    }

    fun init(
        tasksSyncRepository: TasksSyncRepository
        , signInSuccessPublisher: Publisher<AuthToken>): TasksSyncOperationsProvider {

        this.tasksSyncRepository = tasksSyncRepository

        TasksCreatedPublisher.register(CreateLocalTasksSyncSubscriber(this.tasksSyncRepository))
        TasksCreatedSyncedPublisher.register(CreateSyncedTasksSyncSubscriber(this.tasksSyncRepository))
        TasksUpdatedPublisher.register(UpdateTasksSyncSubscriber(this.tasksSyncRepository))
        TasksCompletedPublisher.register(CompleteTasksSyncSubscriber(this.tasksSyncRepository))
        TasksSyncSuccessPublisher.register(CreateLocalTasksSyncSubscriber(this.tasksSyncRepository))
        signInSuccessPublisher.register(SignInSuccessSubscriber())

        return this
    }

    fun getLocalTasksSync(): GetLocalTasksSync {
        return GetLocalTasksSync(tasksSyncRepository)
    }

    fun getDirtyTasksSync(): GetDirtyTasksSync {
        return GetDirtyTasksSync(tasksSyncRepository)
    }

    fun getCompleteTasksSync(): GetCompleteTasksSync {
        return GetCompleteTasksSync(tasksSyncRepository)
    }

    fun markTasksSynced(): MarkTasksSynced {
        return MarkTasksSynced(tasksSyncRepository)
    }

    fun deleteTaskSyncByTaskId(): DeleteTaskSyncByTaskId {
        return DeleteTaskSyncByTaskId(tasksSyncRepository)
    }
}