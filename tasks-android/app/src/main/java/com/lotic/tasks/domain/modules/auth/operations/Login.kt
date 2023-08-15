package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.client.AuthClient
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.shared.Command
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.shared.Query

class Login(
    private val repositoryAuthToken: RepositoryAuthToken
    , private val getAccountByEmailQuery: Query<String, Account?>
    , private val newAccountCommand: Command<Account>) : Command<Credentials> {

    override suspend fun execute(input: Credentials) {
        val authClient: AuthClient? = RetrofitClientProvider.get()?.create(AuthClient::class.java)

        try {
            val result: AuthToken? = authClient?.login(input)
            result?.also {
                repositoryAuthToken.deleteAllForAccount(it.accountId)
                repositoryAuthToken.insert(it)
                if (getAccountByEmailQuery.execute(input.subject) == null) {
                    newAccountCommand.execute(Account(it.accountId, input.subject))
                }
            }
            EventBus.post(Event(EventType.LOGIN_SUCCESS))
        } catch (e: Exception) {
            val localAccount: Account? = getAccountByEmailQuery.execute(input.subject)
            localAccount?.also {
                repositoryAuthToken.deleteAllForAccount(it.id)
            }
            EventBus.post(Event(EventType.LOGIN_FAILURE))
        }
    }
}