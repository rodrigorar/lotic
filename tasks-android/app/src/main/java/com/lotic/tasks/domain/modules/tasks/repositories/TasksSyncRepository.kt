package com.lotic.tasks.domain.modules.tasks.repositories

import com.lotic.tasks.domain.modules.tasks.data.DAOTasksSync
import com.lotic.tasks.domain.modules.tasks.data.EntityTasksSync
import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.persistence.Repository
import java.util.*

class TasksSyncRepository(private val tasksSyncDAO: DAOTasksSync) : Repository<UUID, TasksSync> {

    override suspend fun insert(entity: TasksSync) {
        this.tasksSyncDAO.insert(entity.toEntity())
    }

    override suspend fun update(id: UUID, entity: TasksSync) {
        // TODO("Not implemented")
        // We will need to merge the DTO and Entity together
    }

    override suspend fun getById(id: UUID): TasksSync? {
        return this.tasksSyncDAO.getById(id)?.let { TasksSync.fromEntity(it) }
    }

    override suspend fun delete(id: UUID) {
        val taskSync: EntityTasksSync? = this.tasksSyncDAO.getById(id)
        taskSync?.also { this.tasksSyncDAO.delete(it) }
    }
}