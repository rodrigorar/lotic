package com.lotic.tasks.domain.modules.tasks

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.client.TasksClient
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.operations.CreateTasks
import kotlinx.coroutines.runBlocking
import retrofit2.HttpException

class SyncManager(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    private val tasksClient: TasksClient? = RetrofitClientProvider.get()?.create(TasksClient::class.java)
    private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()
    private val createTasksOperation: CreateTasks = TasksOperationsProvider.createTasks()

    override fun doWork(): Result {
        try {
            runBlocking {
                val currentSession: AuthToken? = currentActiveAuthSessionProvider.get()

                currentSession?.let { authToken ->
                    try {
                        val serverTasks: List<Task>? =
                            tasksClient?.listTasksForAccount(authToken.accountId)?.toDTO()
                        serverTasks?.also { tasks ->
                            createTasksOperation.execute(tasks)
                        }
                        EventBus.post(Event(EventType.SYNC_SUCCESS))
                    } catch (e: HttpException) {
                        // FIXME: We should refresh the token not delete them all
                        EventBus.post(Event(EventType.SYNC_FAILURE))
                    }
                }

                Log.d("SynchManager", "Finished Synching with the server")
            }

            return Result.retry()
        } catch (e: Exception) {
            Log.d("SynchManager", "Retrying another time")
            return Result.retry()
        }
    }

}