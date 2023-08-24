package com.lotic.tasks.domain.modules.auth

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.adapters.modules.auth.persistence.EntityAuthToken
import com.lotic.tasks.domain.shared.FromEntity
import com.lotic.tasks.domain.shared.ToEntity
import java.util.*

data class AuthToken(
    @SerializedName("token") val token: String
    , @SerializedName("refresh_token") val refreshToken: String
    , @SerializedName("account_id") val accountId: UUID
    , @SerializedName("expires_at") val expiresAt: String) // FIXME: expiresAt should be of type ZonedDateTime not String
: ToEntity<EntityAuthToken> {

    companion object : FromEntity<AuthToken, EntityAuthToken> {

        // FIXME: Move this to the Persistence Entity (EntityAuthToken)
        override fun fromEntity(entity: EntityAuthToken): AuthToken {
            return AuthToken(
                token = entity.accessToken
                , refreshToken = entity.refreshToken
                , accountId = entity.accountId
                , expiresAt = entity.expiresAt.toString())
        }
    }

    // FIXME: Move this to the Persistence Entity (EntityAuthToken)
    override fun toEntity(): EntityAuthToken {
        return EntityAuthToken(
            accessToken = token
            , refreshToken = refreshToken
            , accountId = accountId
            , expiresAt = expiresAt)
    }
}
