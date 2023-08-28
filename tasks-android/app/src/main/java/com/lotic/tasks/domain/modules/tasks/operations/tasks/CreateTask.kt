package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import java.util.*

class CreateTask(
    private val tasksRepository: TasksRepository
    , private val tasksCreatedPublisher: Publisher<List<UUID>>
) : Command<Task> {

    override suspend fun execute(input: Task) {
        this.tasksRepository.insert(input)
        this.tasksCreatedPublisher.publish(Event(listOf(input.id)))
    }

}