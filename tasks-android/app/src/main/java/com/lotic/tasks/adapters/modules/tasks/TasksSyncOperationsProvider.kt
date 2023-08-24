package com.lotic.tasks.adapters.modules.tasks

import android.content.Context
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.tasks.events.CompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.events.CreateTasksSync
import com.lotic.tasks.domain.modules.tasks.events.UpdateTasksSync
import com.lotic.tasks.adapters.TasksDatabase
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.DeleteTaskSyncByTaskId
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetCompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetDirtyTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetLocalTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.MarkTasksSynced
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object TasksSyncOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var tasksSyncRepository: TasksSyncRepository

    override fun setContextProvider(contextProvider: Provider<Context>): TasksSyncOperationsProvider {
        TasksSyncOperationsProvider.contextProvider = contextProvider
        return this
    }

    fun init(tasksSyncRepository: TasksSyncRepository): TasksSyncOperationsProvider {
        this.tasksSyncRepository = tasksSyncRepository

        // XXX: This probably should not be done here, but i have no better idea
        EventBus.subscribe(
            listOf(
                EventType.TASKS_CREATED
                , EventType.TASKS_CREATED_SYNCED
                , EventType.SYNC_SUCCESS)
            , CreateTasksSync(tasksSyncRepository)
        )
        EventBus.subscribe(EventType.TASKS_UPDATED, UpdateTasksSync(tasksSyncRepository))
        EventBus.subscribe(EventType.TASKS_COMPLETED, CompleteTasksSync(tasksSyncRepository))

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