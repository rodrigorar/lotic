package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import android.content.Context
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.observers.CompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.observers.CreateTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.observers.UpdateTasksSync
import com.lotic.tasks.domain.modules.tasks.repositories.TasksSyncRepository
import com.lotic.tasks.domain.persistence.TasksDatabase
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object TasksSyncOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var tasksSyncRepository: TasksSyncRepository

    override fun setContextProvider(contextProvider: Provider<Context>): TasksSyncOperationsProvider {
        this.contextProvider = contextProvider
        return this
    }

    fun init(): TasksSyncOperationsProvider {
        this.tasksSyncRepository =
            TasksSyncRepository(
                TasksDatabase.getDatabase(contextProvider.get()).daoTasksSync())

        // XXX: This probably should not be done here, but i have no better idea
        EventBus.subscribe(
            listOf(EventType.TASKS_CREATED, EventType.SYNC_SUCCESS)
            , CreateTasksSync(this.tasksSyncRepository)
        )
        EventBus.subscribe(EventType.TASKS_UPDATED, UpdateTasksSync(this.tasksSyncRepository))
        EventBus.subscribe(EventType.TASKS_COMPLETED, CompleteTasksSync(this.tasksSyncRepository))

        return this
    }

    fun getLocalTasksSync(): GetLocalTasksSync {
        return GetLocalTasksSync(this.tasksSyncRepository)
    }

    fun getDirtyTasksSync(): GetDirtyTasksSync {
        return GetDirtyTasksSync(this.tasksSyncRepository)
    }

    fun getCompleteTasksSync(): GetCompleteTasksSync {
        return GetCompleteTasksSync(this.tasksSyncRepository)
    }

    fun markTasksSynced(): MarkTasksSynced {
        return MarkTasksSynced(this.tasksSyncRepository)
    }

    fun deleteTaskSyncByTaskId(): DeleteTaskSyncByTaskId {
        return DeleteTaskSyncByTaskId(this.tasksSyncRepository)
    }
}