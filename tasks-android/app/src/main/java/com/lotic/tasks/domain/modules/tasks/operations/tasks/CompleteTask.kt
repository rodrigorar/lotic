package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import java.util.*

class CompleteTask(
    private val tasksRepository: TasksRepository
    , private val tasksCompletedPublisher: Publisher<UUID>
) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        this.tasksRepository.delete(input)
        this.tasksCompletedPublisher.publish(Event(input))
    }

}