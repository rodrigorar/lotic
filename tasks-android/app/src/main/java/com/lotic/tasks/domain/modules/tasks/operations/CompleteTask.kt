package com.lotic.tasks.domain.modules.tasks.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Command
import java.util.*

class CompleteTask(private val tasksRepository: TasksRepository) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        this.tasksRepository.delete(input)

        // TODO: Mark tasks sync as completed to be synched with the server
        EventBus.post(Event(EventType.TASKS_COMPLETED))
    }

}