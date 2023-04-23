package com.lotic.tasks.domain.modules.tasks.client

import com.lotic.tasks.domain.modules.tasks.client.payloads.CreateTasksRequest
import com.lotic.tasks.domain.modules.tasks.client.payloads.TaskListResponse
import com.lotic.tasks.domain.modules.tasks.client.payloads.UpdateTasksRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.UUID

const val TASKS_URL: String = "tasks"

interface TasksClient {

    @POST(TASKS_URL)
    suspend fun createTasks(@Body tasks: CreateTasksRequest)

    @PUT(TASKS_URL)
    suspend fun updateTasks(@Body tasks: UpdateTasksRequest): Response<Void> // Needed because the response may be 204

    @GET(TASKS_URL)
    suspend fun listTasksForAccount(@Query("account_id") accountId: UUID): TaskListResponse

    @DELETE("$TASKS_URL/{task_id}")
    suspend fun deleteTask(@Path("task_id") taskId: String): Response<Void>

}