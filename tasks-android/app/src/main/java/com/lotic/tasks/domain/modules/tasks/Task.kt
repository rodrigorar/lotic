package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTask
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.mappers.FromEntity
import com.lotic.tasks.domain.shared.mappers.ToEntity
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Id
import com.lotic.tasks.domain.shared.value_objects.Title
import java.time.ZonedDateTime
import java.util.*

data class Task(
    val id: Id<Task>
    , val title: Title
    , val description: Description = Description.of("")
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime
    , val ownerId: Id<Account>?) : ToEntity<EntityTask> {

    companion object : FromEntity<Task, EntityTask> {

        // FIXME: Move this to the Persistence Entity (EntityTask)
        override fun fromEntity(entity: EntityTask): Task {
            return Task(
                id = Task.idOf(entity.id)
                , title = Title.of(entity.title)
                , description = Description.of(entity.description)
                , createdAt = ZonedDateTime.parse(entity.createdAt)
                , updatedAt = ZonedDateTime.parse(entity.updatedAt)
                , ownerId = entity.ownerId?.let { Account.idOf(it) })
        }

        fun idOf(value: UUID): Id<Task> {
            return Id(value)
        }

        fun newId(): Id<Task> {
            return Id(UUID.randomUUID())
        }

    }

    // FIXME: Move this to the Persistence Entity (EntityTask)
    override fun toEntity(): EntityTask {
        return EntityTask(
            id = this.id.value
            , title = this.title.value
            , description = this.description.value
            , createdAt = this.createdAt.toString()
            , updatedAt = this.updatedAt.toString()
            , ownerId = this.ownerId?.value)
    }

}
