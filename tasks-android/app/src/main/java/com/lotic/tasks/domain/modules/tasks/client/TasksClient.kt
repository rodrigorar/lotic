package com.lotic.tasks.domain.modules.tasks.client

import retrofit2.http.GET
import retrofit2.http.Query
import java.util.*

interface TasksClient {

    @GET("tasks")
    suspend fun listTasksForAccount(@Query("account_id") accountId: UUID): TaskListResponse

}