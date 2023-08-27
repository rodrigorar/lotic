package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.operations.SuspendedProvider

class CurrentActiveAuthSessionProvider(
    private val authTokenRepository: AuthTokenRepository
) : SuspendedProvider<AuthToken?> {

    override suspend fun get(): AuthToken? {
        return authTokenRepository.getActiveAuthSession()
    }

}