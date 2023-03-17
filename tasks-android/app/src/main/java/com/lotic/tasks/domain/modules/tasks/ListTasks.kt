package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.shared.Provider
import java.time.ZonedDateTime
import java.util.*

class ListTasks() : Provider<List<Task>> {

    override fun execute(): List<Task> {
        val ownerId = UUID.randomUUID()
        return listOf(
            Task(
                UUID.randomUUID()
                , "Task #1"
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , ownerId)
            , Task(
                UUID.randomUUID()
                , "Task #2"
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , ownerId)
            , Task(
                UUID.randomUUID()
                , "Task #3"
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , ownerId)
        )
    }
}