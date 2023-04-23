package com.lotic.tasks.domain.modules.tasks.client

import com.lotic.tasks.domain.modules.tasks.client.payloads.CreateTasksRequest
import com.lotic.tasks.domain.modules.tasks.client.payloads.TaskListResponse
import com.lotic.tasks.domain.modules.tasks.client.payloads.UpdateTasksRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Query
import java.util.*

interface TasksClient {

    @POST("tasks")
    suspend fun createTasks(@Body tasks: CreateTasksRequest)

    @PUT("tasks")
    suspend fun updateTasks(@Body tasks: UpdateTasksRequest): Response<Void> // Needed because the response may be 204

    @GET("tasks")
    suspend fun listTasksForAccount(@Query("account_id") accountId: UUID): TaskListResponse

}