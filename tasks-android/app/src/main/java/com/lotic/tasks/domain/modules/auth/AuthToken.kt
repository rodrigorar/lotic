package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.value_objects.Id

data class AuthToken(
    val token: AccessToken
    , val refreshToken: RefreshToken
    , val accountId: Id<Account>
    , val expiresAt: String) // FIXME: expiresAt should be of type ZonedDateTime not String
