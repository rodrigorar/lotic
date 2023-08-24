package com.lotic.tasks.adapters.modules.tasks.gateways

class DeleteTaskGateway : RetrofitTasksGateway<String, Unit>() {

    override suspend fun call(payload: String) {
        this.tasksClient?.deleteTask(payload)
    }
}