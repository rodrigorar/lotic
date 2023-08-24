package com.lotic.tasks.adapters.modules.tasks.gateways

import com.lotic.tasks.domain.modules.tasks.client.payloads.UpdateTasksRequest
import com.lotic.tasks.domain.modules.tasks.Task

class UpdateTasksGateway : RetrofitTasksGateway<List<Task>, Unit>() {

    override suspend fun call(payload: List<Task>) {
        this.tasksClient?.updateTasks(UpdateTasksRequest.fromDTO(payload))
    }
}