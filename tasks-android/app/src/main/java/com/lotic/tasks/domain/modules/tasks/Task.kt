package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Id
import com.lotic.tasks.domain.shared.value_objects.Position
import com.lotic.tasks.domain.shared.value_objects.Title
import java.time.ZonedDateTime
import java.util.*

data class Task(
    val id: Id<Task>
    , val title: Title
    , val description: Description = Description.of("")
    , val position: Position
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime
    , val ownerId: Id<Account>?) {

    companion object {

        fun idOf(value: UUID): Id<Task> {
            return Id(value)
        }

        fun newId(): Id<Task> {
            return Id(UUID.randomUUID())
        }

    }
}
