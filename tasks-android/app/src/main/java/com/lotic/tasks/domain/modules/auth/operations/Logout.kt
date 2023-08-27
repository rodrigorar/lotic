package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.NoInputCommand
import java.util.*

class Logout(
    private val authTokenRepository: AuthTokenRepository
    , private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
    , private val logoutSuccessPublisher: Publisher<UUID>
    , private val logoutGateway: Gateway<AuthToken, Unit>
) : NoInputCommand {

    override suspend fun execute() {
        try {
            val currentActiveAuthSession: AuthToken? = currentActiveAuthSessionProvider.get()

            currentActiveAuthSession?.also {
                this.logoutGateway.call(it)
                authTokenRepository.deleteAllForAccount(it.accountId)

                logoutSuccessPublisher.publish(com.lotic.tasks.domain.shared.events.Event(it.accountId))
            }

            // CONTINUE HERE

            // FIXME: Use a Logout Success Publisher
            EventBus.post(Event(EventType.LOGOUT_SUCCESS))
        } catch (e: Exception) {
            // FIXME: Use a Logout Failure Publisher
            EventBus.post(Event(EventType.LOGOUT_FAILURE))

            throw e
        }
    }

}