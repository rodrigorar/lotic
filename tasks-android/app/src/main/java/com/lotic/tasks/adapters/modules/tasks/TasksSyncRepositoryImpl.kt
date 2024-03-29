package com.lotic.tasks.adapters.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.DAOTasksSync
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.shared.value_objects.Id

class TasksSyncRepositoryImpl(private val tasksSyncDAO: DAOTasksSync) : TasksSyncRepository {

    override suspend fun insert(entity: TasksSync) {
        this.tasksSyncDAO.insert(EntityTasksSync.fromDomain(entity))
    }

    override suspend fun update(entity: TasksSync) {
        this.tasksSyncDAO.update(EntityTasksSync.fromDomain(entity))
    }

    override suspend fun updateMultiple(tasksSync: List<TasksSync>) {
        tasksSync.forEach {
            tasksSyncDAO.update(EntityTasksSync.fromDomain(it))
        }
    }

    override suspend fun getById(id: Id<TasksSync>): TasksSync? {
        return this.tasksSyncDAO.getById(id.value)?.toDomain()
    }

    override suspend fun getByTaskId(taskId: Id<Task>): TasksSync? {
        return this.tasksSyncDAO.getByTaskId(taskId.value)?.toDomain()

    }

    override suspend fun getByTaskIds(taskIds: List<Id<Task>>): List<TasksSync> {
        return this.tasksSyncDAO
            .getByTaskIds(taskIds.map { it.value })
            .map { it.toDomain() }

    }

    override suspend fun getByStatus(status: SyncStatus): List<TasksSync> {
        return this.tasksSyncDAO
            .getByStatus(status.name)
            .map { it.toDomain() }
    }

    override suspend fun delete(id: Id<TasksSync>) {
        val taskSync: EntityTasksSync? = this.tasksSyncDAO.getById(id.value)
        taskSync?.run { tasksSyncDAO.delete(this) }
    }
}