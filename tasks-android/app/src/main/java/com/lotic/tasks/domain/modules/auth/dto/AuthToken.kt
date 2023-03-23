package com.lotic.tasks.domain.modules.auth.dto

import java.time.ZonedDateTime

data class AuthToken(
    val accessToken: String
    , val refreshToken: String
    , val expiresAt: ZonedDateTime)
