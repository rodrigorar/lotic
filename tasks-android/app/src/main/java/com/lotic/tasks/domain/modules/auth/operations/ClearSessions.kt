package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.operations.Command
import java.util.*

class ClearSessions(
    private val authTokenRepository: AuthTokenRepository
) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        authTokenRepository.deleteAllForAccount(input)
    }

}