package com.lotic.tasks.domain.modules.tasks.client.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.adapters.http.translators.ToDTO
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import java.time.ZonedDateTime
import java.util.*

data class TaskResponse(
    @SerializedName("task_id") val id: UUID
    , @SerializedName("title") val title: String
    , @SerializedName("description") val description: String
    , @SerializedName("owner_id") val ownerId: UUID
) : ToDTO<Task> {

    override fun toDTO(): Task {
        return Task(
            id = this.id
            , title = this.title
            , description = this.description
            , createdAt = ZonedDateTime.now() // FIXME: This info should come from the server
            , updatedAt = ZonedDateTime.now() // FIXME: This info should come from the server
            , ownerId = this.ownerId)
    }
}

data class TaskListResponse(
    @SerializedName("tasks") val tasks: List<TaskResponse>) : ToDTO<List<Task>> {

    override fun toDTO(): List<Task> {
        return tasks.map {
            it.toDTO()
        }
    }
}