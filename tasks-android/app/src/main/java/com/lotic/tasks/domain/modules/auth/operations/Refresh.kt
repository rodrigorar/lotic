package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.Gateway

class Refresh(
    private val authTokenRepository: AuthTokenRepository
    , private val logoutOperation: SignOut
    , private val refreshGateway: Gateway<AuthToken, AuthToken?>) : Command<AuthToken> {

    override suspend fun execute(input: AuthToken) {
        try {
            val result: AuthToken? = this.refreshGateway.call(input)
            authTokenRepository.deleteAllForAccount(input.accountId)
            result?.let {
                authTokenRepository.insert(it)
            }
        } catch (e: Exception) {
            logoutOperation.execute()
        }
    }

}