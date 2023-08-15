package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.NoInputCommand
import java.util.*

class Logout(
    private val repositoryAuthToken: AuthTokenRepository
    , private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
    , private val logoutGateway: Gateway<UUID, Unit>
) : NoInputCommand {

    override suspend fun execute() {
        val currentActiveAuthSession: AuthToken? = currentActiveAuthSessionProvider.get()

        currentActiveAuthSession?.also {
            this.logoutGateway.call(it.accountId)
            repositoryAuthToken.deleteAllForAccount(it.accountId)

            EventBus.post(Event(EventType.LOGOUT_SUCCESS))
        }
    }

}