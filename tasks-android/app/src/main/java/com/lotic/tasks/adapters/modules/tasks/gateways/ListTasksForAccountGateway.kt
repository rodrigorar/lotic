package com.lotic.tasks.adapters.modules.tasks.gateways

import com.lotic.tasks.domain.modules.tasks.Task
import java.util.*

class ListTasksForAccountGateway : RetrofitTasksGateway<UUID, List<Task>>() {

    override suspend fun call(payload: UUID): List<Task> {
        val result = this.tasksClient?.listTasksForAccount(payload)
        return result?.toDTO() ?: listOf()
    }
}