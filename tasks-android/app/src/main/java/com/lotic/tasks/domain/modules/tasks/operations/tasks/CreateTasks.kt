package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TasksCreatedEventInfo
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.Command

class CreateTasks(private val tasksRepository: TasksRepository) : Command<List<Task>> {

    override suspend fun execute(input: List<Task>) {
        this.tasksRepository.insertMultiple(input)
        // FIXME: Use the Tasks Created Publisher instead
        EventBus.post(
            Event(
                EventType.TASKS_CREATED
                , TasksCreatedEventInfo(input.map { it.id })
            )
        )
    }

}