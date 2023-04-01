package com.lotic.tasks.domain.modules.tasks.client

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.http.translators.ToDTO
import com.lotic.tasks.domain.modules.tasks.dtos.Task

class TaskListResponse(
    @SerializedName("tasks") val tasks: List<TaskResponse>) : ToDTO<List<Task>> {

    override fun toDTO(): List<Task> {
        return tasks.map {
            it.toDTO()
        }
    }
}