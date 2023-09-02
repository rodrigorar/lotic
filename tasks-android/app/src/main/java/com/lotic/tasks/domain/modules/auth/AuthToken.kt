package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.adapters.modules.auth.persistence.EntityAuthToken
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.mappers.FromEntity
import com.lotic.tasks.domain.shared.mappers.ToEntity
import com.lotic.tasks.domain.shared.value_objects.Id

data class AuthToken(
    val token: AccessToken
    , val refreshToken: RefreshToken
    , val accountId: Id<Account>
    , val expiresAt: String) // FIXME: expiresAt should be of type ZonedDateTime not String
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
