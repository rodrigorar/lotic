package com.lotic.tasks.domain.modules.tasks.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import java.util.*

@Dao
interface DAOTasksSync {
    @Insert
    suspend fun insert(tasksSync: EntityTasksSync)

    @Update
    suspend fun update(tasksSync: EntityTasksSync)

    @Query("SELECT * FROM tasks_sync WHERE id = :id")
    suspend fun getById(id: UUID): EntityTasksSync?

    @Delete
    suspend fun delete(tasksSync: EntityTasksSync)
}