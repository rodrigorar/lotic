package com.lotic.tasks.domain.modules.tasks.repositories

import com.lotic.tasks.domain.modules.tasks.data.DAOTasks
import com.lotic.tasks.domain.modules.tasks.data.EntityTask
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.persistence.Repository
import java.util.*

class TasksRepository(private val tasksDAO: DAOTasks) : Repository<UUID, Task> {

    override suspend fun insert(entity: Task) {
        throw NotImplementedError("TasksRepository#insert is not implemented")
    }

    suspend fun insertMultiple(entities: List<Task>) {
        entities.forEach { entry ->  tasksDAO.insert(entry.toEntity())}
    }

    override suspend fun update(id: UUID, entity: Task) {
        throw NotImplementedError("TasksRepository#update is not implemented")
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

    override suspend fun delete(id: UUID) {
        throw NotImplementedError("TasksRepository#delete not implemented")
    }

}