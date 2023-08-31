package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.NoInputCommand
import com.lotic.tasks.domain.shared.value_objects.Id

class Logout(
    private val authTokenRepository: AuthTokenRepository
    , private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
    , private val logoutSuccessPublisher: Publisher<Id<Account>>
    , private val logoutGateway: Gateway<AuthToken, Unit>
) : NoInputCommand {

    override suspend fun execute() {
        val currentActiveAuthSession: AuthToken? = currentActiveAuthSessionProvider.get()

        currentActiveAuthSession?.also {
            this.logoutGateway.call(it)
            authTokenRepository.deleteAllForAccount(it.accountId)
            logoutSuccessPublisher.publish(Event(it.accountId))
        }
    }

}