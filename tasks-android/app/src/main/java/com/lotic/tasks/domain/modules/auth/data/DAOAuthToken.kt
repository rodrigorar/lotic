package com.lotic.tasks.domain.modules.auth.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import java.util.*

@Dao
interface DAOAuthToken {

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(authToken: EntityAuthToken)

    @Query("SELECT * FROM auth_tokens WHERE account_id = :accountId")
    suspend fun getByAccountId(accountId: UUID): EntityAuthToken?

    @Query("SELECT * FROM auth_tokens WHERE id = :id")
    suspend fun getById(id: Int): EntityAuthToken?

    @Delete
    suspend fun delete(authToken: EntityAuthToken)
}