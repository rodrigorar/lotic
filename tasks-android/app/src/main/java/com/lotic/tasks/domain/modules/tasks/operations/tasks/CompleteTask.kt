package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TaskCompletedEventInfo
import com.lotic.tasks.domain.modules.tasks.repositories.TasksRepository
import com.lotic.tasks.domain.shared.Command
import java.util.*

class CompleteTask(private val tasksRepository: TasksRepository) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        this.tasksRepository.delete(input)
        EventBus.post(
            Event(
                EventType.TASKS_COMPLETED
                , TaskCompletedEventInfo(input)))
    }

}