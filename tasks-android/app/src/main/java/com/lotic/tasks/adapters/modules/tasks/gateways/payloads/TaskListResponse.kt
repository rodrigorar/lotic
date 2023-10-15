package com.lotic.tasks.adapters.modules.tasks.gateways.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.adapters.http.translators.ToDTO
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Position
import com.lotic.tasks.domain.shared.value_objects.Title
import java.time.ZonedDateTime
import java.util.*

data class TaskResponse(
    @SerializedName("task_id") val id: UUID
    , @SerializedName("title") val title: String
    , @SerializedName("position") val position: Int
    , @SerializedName("description") val description: String
    , @SerializedName("owner_id") val ownerId: UUID
) : ToDTO<Task> {

    override fun toDTO(): Task {
        return Task(
            id = Task.idOf(this.id)
            , title = Title(this.title)
            , description = Description(this.description)
            , position = Position.of(this.position)
            , createdAt = ZonedDateTime.now() // FIXME: This info should come from the server
            , updatedAt = ZonedDateTime.now() // FIXME: This info should come from the server
            , ownerId = Account.idOf(this.ownerId))
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