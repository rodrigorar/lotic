package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.events.payloads.TasksCreatedSyncedEventInfo
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.operations.Command

class CreateTasksSynced(private val tasksRepository: TasksRepository) : Command<List<Task>> {

    override suspend fun execute(input: List<Task>) {
        this.tasksRepository.insertMultiple(input)
        // FIXME: Use the Tasks Created Synced Publisher instead
        EventBus.post(
            Event(
                EventType.TASKS_CREATED_SYNCED
                , TasksCreatedSyncedEventInfo(input.map { it.id })
            )
        )
    }

}