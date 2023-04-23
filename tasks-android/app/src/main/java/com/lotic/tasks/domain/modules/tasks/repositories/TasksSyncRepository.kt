package com.lotic.tasks.domain.modules.tasks.repositories

import com.lotic.tasks.domain.modules.tasks.data.DAOTasksSync
import com.lotic.tasks.domain.modules.tasks.data.EntityTasksSync
import com.lotic.tasks.domain.modules.tasks.dtos.SyncStatus
import com.lotic.tasks.domain.modules.tasks.dtos.TasksSync
import com.lotic.tasks.domain.persistence.Repository
import java.util.*

class TasksSyncRepository(private val tasksSyncDAO: DAOTasksSync) : Repository<UUID, TasksSync> {

    override suspend fun insert(entity: TasksSync) {
        this.tasksSyncDAO.insert(entity.toEntity())
    }

    override suspend fun update(id: UUID, entity: TasksSync) {
        this.tasksSyncDAO.update(entity.toEntity())
    }

    suspend fun updateMultiple(tasksSync: List<TasksSync>) {
        tasksSync.forEach {
            tasksSyncDAO.update(it.toEntity())
        }
    }

    override suspend fun getById(id: UUID): TasksSync? {
        return this.tasksSyncDAO.getById(id)?.let { TasksSync.fromEntity(it) }
    }

    suspend fun getByTaskId(taskId: UUID): TasksSync? {
        return this.tasksSyncDAO
            .getByTaskId(taskId)
            ?.let { TasksSync.fromEntity(it) }

    }

    suspend fun getByTaskIds(taskIds: List<UUID>): List<TasksSync> {
        return this.tasksSyncDAO
            .getByTaskIds(taskIds)
            .map { TasksSync.fromEntity(it) }

    }

    suspend fun getByStatus(status: SyncStatus): List<TasksSync> {
        return this.tasksSyncDAO
            .getByStatus(status.name)
            .map { TasksSync.fromEntity(it) }
    }

    override suspend fun delete(id: UUID) {
        val taskSync: EntityTasksSync? = this.tasksSyncDAO.getById(id)
        taskSync?.also { this.tasksSyncDAO.delete(it) }
    }
}