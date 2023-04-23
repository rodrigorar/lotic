package com.lotic.tasks.domain.modules.tasks.client.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import java.time.format.DateTimeFormatter

data class CreateTaskRequest(
    @SerializedName("task_id") val taskId: String
    , @SerializedName("title") val title: String
    , @SerializedName("description") val description: String
    , @SerializedName("created_at") val createdAt: String
    , @SerializedName("updated_at") val updatedAt: String
    , @SerializedName("owner_id") val ownerId: String) {

    companion object {
        fun fromDTO(task: Task): CreateTaskRequest {
            return CreateTaskRequest(
                task.id.toString()
                , task.title
                , task.description
                , task.createdAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                , task.updatedAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                , task.ownerId.toString())
        }
    }
}

data class CreateTasksRequest(@SerializedName("tasks") val tasks: List<CreateTaskRequest>) {

    companion object {
        fun fromDTO(tasks: List<Task>): CreateTasksRequest {
            return CreateTasksRequest(tasks.map { CreateTaskRequest.fromDTO(it) })
        }
    }
}
