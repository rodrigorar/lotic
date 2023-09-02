package com.lotic.tasks.adapters.modules.auth.persistence

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import java.util.*

@Entity(tableName = "auth_tokens")
data class EntityAuthToken(
    @PrimaryKey(autoGenerate = true) val id: Int = 0
    , @ColumnInfo(name = "access_token") val accessToken: String
    , @ColumnInfo(name = "refresh_token") val refreshToken: String
    , @ColumnInfo(name = "account_id") val accountId: UUID
    , @ColumnInfo(name = "expires_at") val expiresAt: String) {

    companion object {
        fun fromDomain(entity: AuthToken): EntityAuthToken {
            return EntityAuthToken(
                accessToken = entity.token.value
                , refreshToken = entity.refreshToken.value
                , accountId = entity.accountId.value
                , expiresAt = entity.expiresAt)
        }
    }

    fun toDomain(): AuthToken {
        return AuthToken(
            AccessToken.of(this.accessToken)
            , RefreshToken.of(this.refreshToken)
            , Account.idOf(this.accountId)
            , this.expiresAt)
    }
}
