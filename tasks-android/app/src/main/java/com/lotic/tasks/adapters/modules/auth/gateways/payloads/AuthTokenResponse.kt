package com.lotic.tasks.adapters.modules.auth.gateways.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import java.util.*

data class AuthTokenResponse(
    @SerializedName("token") val token: String
    , @SerializedName("refresh_token") val refreshToken: String
    , @SerializedName("account_id") val accountId: UUID
    , @SerializedName("expires_at") val expiresAt: String) {

    fun toDTO(): AuthToken {
        return AuthToken(
            AccessToken.of(this.token)
            , RefreshToken.of(this.refreshToken)
            , Account.idOf(this.accountId)
            , this.expiresAt)
    }
}
