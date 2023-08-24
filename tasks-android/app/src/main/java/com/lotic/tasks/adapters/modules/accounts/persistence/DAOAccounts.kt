package com.lotic.tasks.adapters.modules.accounts.persistence

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import java.util.*

@Dao
interface DAOAccounts {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(account: EntityAccount)

    @Update
    suspend fun update(account: EntityAccount)

    @Query("SELECT * FROM accounts where id = :id")
    suspend fun getById(id: UUID): EntityAccount?

    @Query("SELECT * FROM accounts WHERE email = :email")
    suspend fun getByEmail(email: String): EntityAccount?

    @Delete
    suspend fun delete(account: EntityAccount)
}