package com.lotic.tasks.domain.modules.tasks

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TasksSyncedEventInfo
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.client.TasksClient
import com.lotic.tasks.domain.modules.tasks.client.payloads.CreateTasksRequest
import com.lotic.tasks.domain.modules.tasks.client.payloads.UpdateTasksRequest
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CreateTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.tasks.GetTasksById
import com.lotic.tasks.domain.modules.tasks.operations.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.operations.tasks.UpdateTask
import com.lotic.tasks.domain.modules.tasks.operations.tasks.UpdateTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.DeleteTaskSyncByTaskId
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetCompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetDirtyTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetLocalTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.MarkTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.TasksSyncOperationsProvider
import kotlinx.coroutines.runBlocking
import retrofit2.HttpException
import java.util.*

class SyncManager(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    private val tasksClient: TasksClient? = RetrofitClientProvider.get()?.create(TasksClient::class.java)

    private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()

    private val getLocalTasksSync: GetLocalTasksSync = TasksSyncOperationsProvider.getLocalTasksSync()
    private val getDirtyTasksSync: GetDirtyTasksSync = TasksSyncOperationsProvider.getDirtyTasksSync()
    private val getCompleteTasksSync: GetCompleteTasksSync = TasksSyncOperationsProvider.getCompleteTasksSync()
    private val markTasksSynced: MarkTasksSynced = TasksSyncOperationsProvider.markTasksSynced()
    private val deleteTaskSyncByTaskId: DeleteTaskSyncByTaskId = TasksSyncOperationsProvider.deleteTaskSyncByTaskId()

    private val createTasksSynced: CreateTasksSynced = TasksOperationsProvider.createTasksSynced()
    private val updateTaskSynced: UpdateTasksSynced = TasksOperationsProvider.updateTaskSynced()
    private val getTasksById: GetTasksById = TasksOperationsProvider.getTasksById()

    override fun doWork(): Result {
        try {
            runBlocking {
                val currentSession: AuthToken? = currentActiveAuthSessionProvider.get()

                currentSession?.let { authSession ->
                    try {
                        // Step 1: Persist local tasks remotely

                        Log.d("SyncManager", "Creating local tasks remotely")

                        val localTaskIds: List<UUID> = getLocalTasksSync.get().map { it.taskId }
                        if (localTaskIds.isNotEmpty()) {
                            val tasksToCreateRemotely: List<Task> =
                                getTasksById.execute(localTaskIds)

                            tasksClient?.run {
                                this.createTasks(CreateTasksRequest.fromDTO(tasksToCreateRemotely))
                                markTasksSynced.execute(tasksToCreateRemotely.map { it.id })
                            }
                        }

                        // Step 2: Update local tasks remotely

                        Log.d("SyncManager", "Update local tasks remotely")

                        val dirtyTaskIds: List<UUID> = getDirtyTasksSync.get().map { it.taskId }
                        if (dirtyTaskIds.isNotEmpty()) {
                            val tasksToUpdateRemotely: List<Task> =
                                getTasksById.execute(dirtyTaskIds)

                            tasksClient?.run {
                                this.updateTasks(UpdateTasksRequest.fromDTO(tasksToUpdateRemotely))
                                Log.d("SyncManager", "Will Call mark tasks synced")
                                markTasksSynced.execute(tasksToUpdateRemotely.map { it.id })
                            }
                        }

                        // Step 3: Delete complete tasks remotely

                        Log.d("SyncManager", "Remove local tasks remotely")

                        val completedTaskIds: List<UUID> = getCompleteTasksSync.get().map { it.taskId }
                        if (completedTaskIds.isNotEmpty()) {
                            // FIXME: This should be a single call, and not a loop
                            completedTaskIds.forEach {
                                tasksClient?.run {
                                    this.deleteTask(it.toString())
                                    deleteTaskSyncByTaskId.execute(it)
                                }
                            }
                        }

                        tasksClient?.run {
                            val remoteTasks: List<Task> =
                                this.listTasksForAccount(authSession.accountId).tasks
                                    .map { it.toDTO() }

                            val accountTaskIds: List<UUID> = getTasksById
                                .execute(remoteTasks.map { it.id })
                                .map { it.id }

                            // Step 4: Get new remote tasks and create them locally
                            val tasksToCreateLocally: List<Task> = remoteTasks
                                .filter { ! accountTaskIds.contains(it.id) }
                            createTasksSynced.execute(tasksToCreateLocally)

                            // Step 5: Get updated remote tasks and update them locally
                            val tasksToUpdateLocally: List<Task> = remoteTasks
                                .filter { accountTaskIds.contains(it.id) }
                            // FIXME: This should be a batch and not a loop
                            tasksToUpdateLocally.forEach {
                                updateTaskSynced.execute(it)
                            }

                            // Step 6: Delete tasks locally that do not exist remotely
                            // TODO: Not implemented
                        }

                        EventBus.post(
                            Event(
                                EventType.SYNC_SUCCESS
                                , TasksSyncedEventInfo(
                                    listOf(/* Will have locally created tasks */)
                                    , listOf(/* Will have the remotely deleted tasks */))))

                    } catch (e: HttpException) {
                        Log.d("SyncManager", e.toString())
                        // FIXME: We should refresh the token not delete them all
                        EventBus.post(Event(EventType.SYNC_FAILURE))
                    }
                }

                Log.d("SynchManager", "Finished Synching with the server")
            }

            return Result.retry()
        } catch (e: Exception) {
            Log.d("SyncManager", "Retrying another time")
            Log.d("SyncManager", e.toString())
            return Result.retry()
        }
    }

}