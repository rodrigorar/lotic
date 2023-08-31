package com.lotic.tasks.domain.modules.auth

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.adapters.modules.auth.persistence.EntityAuthToken
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.mappers.FromEntity
import com.lotic.tasks.domain.shared.mappers.ToEntity
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

data class AuthToken(
    @SerializedName("token") val token: AccessToken
    , @SerializedName("refresh_token") val refreshToken: RefreshToken
    , @SerializedName("account_id") val accountId: Id<Account>
    , @SerializedName("expires_at") val expiresAt: String) // FIXME: expiresAt should be of type ZonedDateTime not String
: ToEntity<EntityAuthToken> {

    companion object : FromEntity<AuthToken, EntityAuthToken> {

        // FIXME: Move this to the Persistence Entity (EntityAuthToken)
        override fun fromEntity(entity: EntityAuthToken): AuthToken {
            return AuthToken(
                token = AccessToken.of(entity.accessToken)
                , refreshToken = RefreshToken(entity.refreshToken)
                , accountId = Account.idOf(entity.accountId)
                , expiresAt = entity.expiresAt)
        }
    }

    // FIXME: Move this to the Persistence Entity (EntityAuthToken)
    override fun toEntity(): EntityAuthToken {
        return EntityAuthToken(
            accessToken = token.value
            , refreshToken = refreshToken.value
            , accountId = accountId.value
            , expiresAt = expiresAt)
    }
}
