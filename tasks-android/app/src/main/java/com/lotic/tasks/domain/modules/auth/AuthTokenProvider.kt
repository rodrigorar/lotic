package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.shared.Provider
import java.time.ZonedDateTime
import java.util.*

object AuthTokenProvider : Provider<AuthToken> {

    override fun execute(): AuthToken {
        // TODO: Not implemented, fake token returned
        return AuthToken(
            UUID.randomUUID().toString()
            , UUID.randomUUID().toString()
            , ZonedDateTime.now().plusHours(1))
    }
}