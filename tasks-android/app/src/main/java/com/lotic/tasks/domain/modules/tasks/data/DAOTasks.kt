package com.lotic.tasks.domain.modules.tasks.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import java.util.*

@Dao
interface DAOTasks {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(tasks: EntityTask)

    @Query("SELECT * FROM tasks WHERE owner_id = :accountId")
    suspend fun listTasksForAccount(accountId: UUID): List<EntityTask>
}