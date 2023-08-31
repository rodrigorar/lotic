package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

class CreateTasks(
    private val tasksRepository: TasksRepository
    , private val tasksCreatedPublisher: Publisher<List<Id<Task>>>
) : Command<List<Task>> {

    override suspend fun execute(input: List<Task>) {
        this.tasksRepository.insertMultiple(input)
        this.tasksCreatedPublisher.publish(Event(input.map { it.id }))
    }

}