package com.lotic.tasks.domain.modules.tasks

import android.util.Log
import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.TasksSyncOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.events.TasksSyncSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.gateways.TasksClient
import com.lotic.tasks.adapters.modules.tasks.gateways.payloads.CreateTasksRequest
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.client.payloads.UpdateTasksRequest
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CompleteTask
import com.lotic.tasks.domain.modules.tasks.operations.tasks.CreateTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.tasks.GetTasksById
import com.lotic.tasks.domain.modules.tasks.operations.tasks.ListTasks
import com.lotic.tasks.domain.modules.tasks.operations.tasks.UpdateTasksSynced
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.DeleteTaskSyncByTaskId
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetCompleteTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetDirtyTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.GetLocalTasksSync
import com.lotic.tasks.domain.modules.tasks.operations.taskssync.MarkTasksSynced
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.value_objects.Id
import kotlinx.coroutines.runBlocking
import retrofit2.HttpException

object SyncManager {

    // FIXME: Migrate the use of this client to use Gateways instead
    private val tasksClient: TasksClient? = RetrofitClientProvider.get()?.create(TasksClient::class.java)

    private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()

    private val getLocalTasksSync: GetLocalTasksSync = TasksSyncOperationsProvider.getLocalTasksSync()
    private val getDirtyTasksSync: GetDirtyTasksSync = TasksSyncOperationsProvider.getDirtyTasksSync()
    private val getCompleteTasksSync: GetCompleteTasksSync = TasksSyncOperationsProvider.getCompleteTasksSync()
    private val markTasksSynced: MarkTasksSynced = TasksSyncOperationsProvider.markTasksSynced()
    private val deleteTaskSyncByTaskId: DeleteTaskSyncByTaskId = TasksSyncOperationsProvider.deleteTaskSyncByTaskId()

    private val createTasksSynced: CreateTasksSynced = TasksOperationsProvider.createTasksSynced()
    private val updateTaskSynced: UpdateTasksSynced = TasksOperationsProvider.updateTaskSynced()
    private val completeTask: CompleteTask = TasksOperationsProvider.completeTasks()
    private val listTasks: ListTasks = TasksOperationsProvider.listTasks()
    private val getTasksById: GetTasksById = TasksOperationsProvider.getTasksById()

    fun execute() {
        runBlocking {
            val currentSession: AuthToken? = currentActiveAuthSessionProvider.get()

            currentSession?.let { authSession ->
                try {
                    // Step 1: Persist local tasks remotely

                    val localTaskIds: List<Id<Task>> = getLocalTasksSync.get().map { it.taskId }
                    if (localTaskIds.isNotEmpty()) {
                        val tasksToCreateRemotely: List<Task> =
                            getTasksById.execute(localTaskIds)

                        tasksClient?.run {
                            this.createTasks(CreateTasksRequest.fromDTO(tasksToCreateRemotely))
                            markTasksSynced.execute(tasksToCreateRemotely.map { it.id })
                        }
                    }

                    // Step 2: Update local tasks remotely

                    val dirtyTaskIds: List<Id<Task>> = getDirtyTasksSync.get().map { it.taskId }
                    if (dirtyTaskIds.isNotEmpty()) {
                        val tasksToUpdateRemotely: List<Task> =
                            getTasksById.execute(dirtyTaskIds)

                        tasksClient?.run {
                            this.updateTasks(UpdateTasksRequest.fromDTO(tasksToUpdateRemotely))
                            markTasksSynced.execute(tasksToUpdateRemotely.map { it.id })
                        }
                    }

                    // Step 3: Delete complete tasks remotely

                    val completedTaskIds: List<Id<Task>> = getCompleteTasksSync.get().map { it.taskId }
                    if (completedTaskIds.isNotEmpty()) {
                        // FIXME: This should be a single call, and not a loop
                        completedTaskIds.forEach {
                            tasksClient?.run {
                                this.deleteTask(it.value.toString())
                                deleteTaskSyncByTaskId.execute(it)
                            }
                        }
                    }

                    tasksClient?.run {
                        val remoteTasks: List<Task> =
                            this.listTasksForAccount(authSession.accountId.value).tasks
                                .map { it.toDTO() }

                        val accountTaskIds: List<Id<Task>> = listTasks
                            .get()
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
                        val remoteTaskIds: List<Id<Task>>  = remoteTasks.map { it.id }
                        val taskToDeleteLocally: List<Id<Task>> = accountTaskIds
                            .filter { ! remoteTaskIds.contains(it) }
                        taskToDeleteLocally.forEach {
                            completeTask.execute(it)
                            deleteTaskSyncByTaskId.execute(it)
                        }
                    }

                    TasksSyncSuccessPublisher.publish(Event(listOf()))
                } catch (e: HttpException) {
                    Log.d("SyncManager", e.toString())
                }
            }

            Log.d("SynchManager", "Finished Synching with the server")
        }
    }
}