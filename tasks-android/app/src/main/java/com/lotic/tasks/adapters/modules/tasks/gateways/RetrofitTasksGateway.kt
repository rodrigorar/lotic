package com.lotic.tasks.adapters.modules.tasks.gateways

import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.domain.shared.Gateway

abstract class RetrofitTasksGateway<I, O> : Gateway<I, O> {
    protected val tasksClient: TasksClient? = RetrofitClientProvider.get()?.create(TasksClient::class.java)
}