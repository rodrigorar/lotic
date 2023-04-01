package com.lotic.tasks.domain.modules.accounts.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface DAOAccounts {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(account: EntityAccount)

    @Query("SELECT * FROM accounts WHERE email = :email")
    suspend fun getByEmail(email: String): EntityAccount?
}