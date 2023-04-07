package com.lotic.tasks.domain.modules.tasks.dtos

import com.lotic.tasks.domain.modules.tasks.data.EntityTasksSync
import com.lotic.tasks.domain.shared.FromEntity
import com.lotic.tasks.domain.shared.ToEntity
import java.util.*

data class TasksSync(val id: UUID) : ToEntity<EntityTasksSync> {

    companion object : FromEntity<TasksSync, EntityTasksSync> {

        override fun fromEntity(entity: EntityTasksSync): TasksSync {
            TODO("Not yet implemented")
        }

    }

    override fun toEntity(): EntityTasksSync {
        TODO("Not yet implemented")
    }

}
