package com.lotic.tasks.domain.modules.auth.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.ZonedDateTime
import java.util.*

@Entity(tableName = "auth_tokens")
data class EntityAuthToken(
    @PrimaryKey(autoGenerate = true) val id: Int = 0
    , @ColumnInfo(name = "access_token") val accessToken: String
    , @ColumnInfo(name = "refresh_token") val refreshToken: String
    , @ColumnInfo(name = "account_id") val accountId: UUID
    , @ColumnInfo(name = "expires_at") val expiresAt: String)
