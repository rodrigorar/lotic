package com.lotic.tasks.domain.modules.tasks.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import java.util.*

@Dao
interface DAOTasks {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(tasks: EntityTask)

    @Update
    suspend fun update(task: EntityTask)

    @Query("SELECT * FROM tasks WHERE owner_id = :accountId")
    suspend fun listTasksForAccount(accountId: UUID): List<EntityTask>

    @Query("SELECT * FROM tasks WHERE id = :taskId")
    suspend fun getById(taskId: UUID): EntityTask?

    @Query("SELECT * FROM tasks WHERE id IN (:taskIds)")
    suspend fun getByIds(taskIds: List<UUID>): List<EntityTask>

    @Delete
    suspend fun delete(task: EntityTask)
}