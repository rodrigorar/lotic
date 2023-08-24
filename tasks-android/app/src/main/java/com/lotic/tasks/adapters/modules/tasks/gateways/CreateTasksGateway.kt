package com.lotic.tasks.adapters.modules.tasks.gateways

import com.lotic.tasks.domain.modules.tasks.client.payloads.CreateTasksRequest
import com.lotic.tasks.domain.modules.tasks.Task

class CreateTasksGateway : RetrofitTasksGateway<List<Task>, Unit>() {

    override suspend fun call(payload: List<Task>) {
        this.tasksClient?.createTasks(CreateTasksRequest.fromDTO(payload))
    }
}