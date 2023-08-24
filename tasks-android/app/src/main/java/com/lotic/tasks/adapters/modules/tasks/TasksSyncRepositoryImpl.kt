package com.lotic.tasks.adapters.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.DAOTasksSync
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import java.util.*

class TasksSyncRepositoryImpl(private val tasksSyncDAO: DAOTasksSync) : TasksSyncRepository {

    override suspend fun insert(entity: TasksSync) {
        this.tasksSyncDAO.insert(entity.toEntity())
    }

    override suspend fun update(id: UUID, entity: TasksSync) {
        this.tasksSyncDAO.update(entity.toEntity())
    }

    override suspend fun updateMultiple(tasksSync: List<TasksSync>) {
        tasksSync.forEach {
            tasksSyncDAO.update(it.toEntity())
        }
    }

    override suspend fun getById(id: UUID): TasksSync? {
        return this.tasksSyncDAO.getById(id)?.let { TasksSync.fromEntity(it) }
    }

    override suspend fun getByTaskId(taskId: UUID): TasksSync? {
        return this.tasksSyncDAO
            .getByTaskId(taskId)
            ?.let { TasksSync.fromEntity(it) }

    }

    override suspend fun getByTaskIds(taskIds: List<UUID>): List<TasksSync> {
        return this.tasksSyncDAO
            .getByTaskIds(taskIds)
            .map { TasksSync.fromEntity(it) }

    }

    override suspend fun getByStatus(status: SyncStatus): List<TasksSync> {
        return this.tasksSyncDAO
            .getByStatus(status.name)
            .map { TasksSync.fromEntity(it) }
    }

    override suspend fun delete(id: UUID) {
        val taskSync: EntityTasksSync? = this.tasksSyncDAO.getById(id)
        taskSync?.run { tasksSyncDAO.delete(this) }
    }
}