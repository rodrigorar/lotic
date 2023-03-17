package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.shared.Provider

fun listTasksProvider(): Provider<List<Task>> {
    return ListTasks()
}
