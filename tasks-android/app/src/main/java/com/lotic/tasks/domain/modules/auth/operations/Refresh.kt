package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.client.AuthClient
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.shared.Command

class Refresh(private val authTokenRepository: RepositoryAuthToken) : Command<AuthToken> {

    override suspend fun execute(input: AuthToken) {
        val authClient: AuthClient? = RetrofitClientProvider.get()?.create(AuthClient::class.java)
        val result: AuthToken? = authClient?.refresh(input.refreshToken)
        if (result != null) {
            authTokenRepository.deleteAllForAccount(input.accountId)
            authTokenRepository.insert(result)
        } else {
            authTokenRepository.deleteAllForAccount(input.accountId)
        }
    }

}