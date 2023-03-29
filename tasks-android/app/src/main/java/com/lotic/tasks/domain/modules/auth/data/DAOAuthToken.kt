package com.lotic.tasks.domain.modules.auth.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import java.util.*

@Dao
interface DAOAuthToken {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(authToken: EntityAuthToken)

    @Query("SELECT * FROM auth_tokens WHERE account_id = :accountId LIMIT 1")
    suspend fun getByAccountId(accountId: UUID): EntityAuthToken?

    @Query("SELECT * FROM auth_tokens WHERE id = :id")
    suspend fun getById(id: Int): EntityAuthToken?

    @Query("DELETE FROM auth_tokens WHERE account_id = :accountId")
    suspend fun deleteAllForAccount(accountId: UUID)

    @Delete
    suspend fun delete(authToken: EntityAuthToken)
}