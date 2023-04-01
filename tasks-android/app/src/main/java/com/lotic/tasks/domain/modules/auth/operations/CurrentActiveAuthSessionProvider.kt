package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.shared.SuspendedProvider

class CurrentActiveAuthSessionProvider(
    private val authTokenRepository: RepositoryAuthToken) : SuspendedProvider<AuthToken?> {

    override suspend fun get(): AuthToken? {
        return authTokenRepository.getActiveAuthSession()
    }

}