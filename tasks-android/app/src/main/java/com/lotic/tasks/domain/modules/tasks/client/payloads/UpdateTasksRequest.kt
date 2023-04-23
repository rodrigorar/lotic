package com.lotic.tasks.domain.modules.tasks.client.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import java.time.format.DateTimeFormatter

data class UpdateTaskRequest(
    @SerializedName("task_id") val taskId: String
    , @SerializedName("title") val title: String
    , @SerializedName("description") val description: String
    , @SerializedName("updated_at") val updatedAt: String) {

    companion object {
        fun fromDTO(task: Task): UpdateTaskRequest {
            return UpdateTaskRequest(
                task.id.toString()
                , task.title
                , task.description
                , task.updatedAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
        }
    }
}

data class UpdateTasksRequest(@SerializedName("tasks") val tasks: List<UpdateTaskRequest>) {

    companion object {
        fun fromDTO(tasks: List<Task>): UpdateTasksRequest {
            return UpdateTasksRequest(tasks.map { UpdateTaskRequest.fromDTO(it) })
        }
    }

}
