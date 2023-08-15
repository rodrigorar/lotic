package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.shared.Command
import java.util.*

class ClearSessions(
    private val authTokenRepository: RepositoryAuthToken
) : Command<UUID> {

    override suspend fun execute(input: UUID) {
        authTokenRepository.deleteAllForAccount(input)
    }

}