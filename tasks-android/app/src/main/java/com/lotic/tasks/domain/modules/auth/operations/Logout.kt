package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.client.AccountIdRequest
import com.lotic.tasks.domain.modules.auth.client.AuthClient
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.shared.NoInputCommand

class Logout(
    private val repositoryAuthToken: RepositoryAuthToken
    , private val currentActiveAuthSessionProvider: CurrentActiveAuthSessionProvider
) : NoInputCommand {

    override suspend fun execute() {
        val currentActiveAuthSession: AuthToken? = currentActiveAuthSessionProvider.get()

        currentActiveAuthSession?.also {
            // FIXME: These clients shouldn't be exposed in the domain layer,
            //  they belong on the infrastructure layer
            val authClient: AuthClient? = RetrofitClientProvider.get()?.create(AuthClient::class.java)
            authClient?.logout(AccountIdRequest(it.accountId))
            repositoryAuthToken.deleteAllForAccount(it.accountId)

            EventBus.post(Event(EventType.LOGOUT_SUCCESS))
        }
    }

}