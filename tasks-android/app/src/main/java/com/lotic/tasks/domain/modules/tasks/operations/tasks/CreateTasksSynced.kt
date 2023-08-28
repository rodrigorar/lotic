package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Command
import java.util.*

class CreateTasksSynced(
    private val tasksRepository: TasksRepository
    , private val tasksCreatedSyncedPublisher: Publisher<List<UUID>>
) : Command<List<Task>> {

    override suspend fun execute(input: List<Task>) {
        this.tasksRepository.insertMultiple(input)
        this.tasksCreatedSyncedPublisher.publish(Event(input.map { it.id }))
    }

}