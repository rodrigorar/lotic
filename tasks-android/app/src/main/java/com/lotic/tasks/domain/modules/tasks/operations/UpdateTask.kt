package com.lotic.tasks.domain.modules.tasks.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Command

class UpdateTask(private val tasksRepository: TasksRepository) : Command<Task> {

    override suspend fun execute(input: Task) {
        this.tasksRepository.update(input.id, input)

        // TODO: Update task sync entry

        EventBus.post(Event(EventType.TASKS_UPDATED))
    }

}