package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

class UpdateTask(
    private val tasksRepository: TasksRepository
    , private val tasksUpdatedPublisher: Publisher<Id<Task>>
) : Command<Task> {

    override suspend fun execute(input: Task) {
        this.tasksRepository.update(input)
        this.tasksUpdatedPublisher.publish(Event(input.id))
    }
}