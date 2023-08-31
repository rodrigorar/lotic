package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id

class CompleteTask(
    private val tasksRepository: TasksRepository
    , private val tasksCompletedPublisher: Publisher<Id<Task>>
) : Command<Id<Task>> {

    override suspend fun execute(input: Id<Task>) {
        this.tasksRepository.delete(input)
        this.tasksCompletedPublisher.publish(Event(input))
    }

}