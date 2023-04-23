package com.lotic.tasks.domain.modules.tasks.repositories

import android.util.Log
import com.lotic.tasks.domain.modules.tasks.data.DAOTasks
import com.lotic.tasks.domain.modules.tasks.data.EntityTask
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.persistence.Repository
import java.time.ZonedDateTime
import java.util.*

class TasksRepository(private val tasksDAO: DAOTasks) : Repository<UUID, Task> {

    override suspend fun insert(entity: Task) {
        this.tasksDAO.insert(entity.toEntity())
    }

    suspend fun insertMultiple(entities: List<Task>) {
        entities.forEach { entry ->  tasksDAO.insert(entry.toEntity())}
    }

    override suspend fun update(id: UUID, entity: Task) {
        val currentTask :EntityTask? = this.tasksDAO.getById(id)
        val updatedTask: EntityTask? = currentTask?.let {
            it.copy(
                title = if (entity.title != it.title) entity.title else it.title
                , description = if (entity.description != it.description) entity.description else it.description
                , updatedAt = ZonedDateTime.now().toString())
        }
        updatedTask?.also { this.tasksDAO.update(it) }
    }

    override suspend fun getById(id: UUID): Task? {
        throw NotImplementedError("TasksRepository#getById is not implemented")
    }

    suspend fun listTasksForAccount(accountId: UUID): List<Task> {
        val result: List<EntityTask> = this.tasksDAO.listTasksForAccount(accountId)
        return result.map {
            Task.fromEntity(it)
        }
    }

    suspend fun getTasksById(accountId: UUID, taskIds: List<UUID>): List<Task> {
        // FIXME: Eventually all these operations should have a context (logged user, etc)
        return this.tasksDAO.getByIds(taskIds)
            .map { Task.fromEntity(it) }
    }

    override suspend fun delete(id: UUID) {
        val result: EntityTask? = this.tasksDAO.getById(id)
        result?.also { this.tasksDAO.delete(it) }
    }

    suspend fun deleteMultiple(idList: List<UUID>) {
        val taskEntities: List<EntityTask> = this.tasksDAO.getByIds(idList)
        taskEntities.forEach {
            this.tasksDAO.delete(it)
        }
    }

}