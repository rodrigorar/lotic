package com.lotic.tasks.adapters.modules.tasks

import com.lotic.tasks.adapters.modules.tasks.persistence.DAOTasks
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTask
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.value_objects.Id
import java.time.ZonedDateTime
import java.util.*

class TasksRepositoryImpl(private val tasksDAO: DAOTasks) : TasksRepository {

    override suspend fun insert(entity: Task) {
        this.tasksDAO.insert(EntityTask.fromDomain(entity))
    }

    override suspend fun insertMultiple(entities: List<Task>) {
        entities.forEach { tasksDAO.insert(EntityTask.fromDomain(it)) }
    }

    override suspend fun update(entity: Task) {
        val currentTask : EntityTask? = this.tasksDAO.getById(entity.id.value)
        val updatedTask: EntityTask? = currentTask?.let {
            it.copy(
                title = if (entity.title.value != it.title) entity.title.value else it.title
                , description = if (entity.description.value != it.description) entity.description.value else it.description
                , position = if (entity.position.value != it.position) entity.position.value else it.position
                , updatedAt = ZonedDateTime.now().toString())
        }
        updatedTask?.also { this.tasksDAO.update(it) }
    }

    override suspend fun getById(id: Id<Task>): Task? {
        throw NotImplementedError("TasksRepository#getById is not implemented")
    }

    override suspend fun listTasksForAccount(accountId: Id<Account>): List<Task> {
        val result: List<EntityTask> = this.tasksDAO.listTasksForAccount(accountId.value)
        return result.map { it.toDomain() }
    }

    override suspend fun getTasksById(accountId: UUID, taskIds: List<Id<Task>>): List<Task> {
        return this.tasksDAO
            .getByIds(taskIds.map { it.value })
            .map { it.toDomain() }
    }

    override suspend fun delete(id: Id<Task>) {
        val result: EntityTask? = this.tasksDAO.getById(id.value)
        result?.also { this.tasksDAO.delete(it) }
    }

    override suspend fun deleteMultiple(taskIds: List<Id<Task>>) {
        val taskEntities: List<EntityTask> = this.tasksDAO.getByIds(taskIds.map { it.value })
        taskEntities.forEach {
            this.tasksDAO.delete(it)
        }
    }

}