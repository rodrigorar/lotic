package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTask
import com.lotic.tasks.domain.shared.FromEntity
import com.lotic.tasks.domain.shared.ToEntity
import java.time.ZonedDateTime
import java.util.UUID

data class Task(
    val id: UUID
    , val title: String
    , val description: String = ""
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime
    , val ownerId: UUID?) : ToEntity<EntityTask> {

    companion object : FromEntity<Task, EntityTask> {

        // FIXME: Move this to the Persistence Entity (EntityTask)
        override fun fromEntity(entity: EntityTask): Task {
            return Task(
                id = entity.id
                , title = entity.title
                , description = entity.description
                , createdAt = ZonedDateTime.parse(entity.createdAt)
                , updatedAt = ZonedDateTime.parse(entity.updatedAt)
                , ownerId = entity.ownerId)
        }

    }

    // FIXME: Move this to the Persistence Entity (EntityTask)
    override fun toEntity(): EntityTask {
        return EntityTask(
            id = this.id
            , title = this.title
            , description = this.description
            , createdAt = this.createdAt.toString()
            , updatedAt = this.updatedAt.toString()
            , ownerId = this.ownerId)
    }

}
