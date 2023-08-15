package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.Command
import com.lotic.tasks.domain.shared.Gateway

class Refresh(
    private val authTokenRepository: AuthTokenRepository
    , private val refreshGateway: Gateway<AuthToken, AuthToken?>) : Command<AuthToken> {

    override suspend fun execute(input: AuthToken) {
        val result: AuthToken? = this.refreshGateway.call(input)
        if (result != null) {
            authTokenRepository.deleteAllForAccount(input.accountId)
            authTokenRepository.insert(result)
        } else {
            authTokenRepository.deleteAllForAccount(input.accountId)
        }
    }

}