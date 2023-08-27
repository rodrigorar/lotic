package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TaskUpdatedEventInfo
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.Command

class UpdateTask(private val tasksRepository: TasksRepository) : Command<Task> {

    override suspend fun execute(input: Task) {
        this.tasksRepository.update(input.id, input)
        // FIXME: Use the Tasks Updated Publisher instead
        EventBus.post(Event(EventType.TASKS_UPDATED, TaskUpdatedEventInfo(input.id)))
    }
}