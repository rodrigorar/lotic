package com.lotic.tasks.domain.modules.auth.dto

import com.google.gson.annotations.SerializedName
import java.time.ZonedDateTime
import java.util.*

data class AuthToken(
    @SerializedName("token") val token: String
    , @SerializedName("refresh_token") val refreshToken: String
    , @SerializedName("account_id") val accountId: UUID
    , @SerializedName("expires_at") val expiresAt: String)
    // FIXME: expiresAt should be of type ZonedDateTime not String
