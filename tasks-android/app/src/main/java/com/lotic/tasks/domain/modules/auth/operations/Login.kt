package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.Credentials
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Query

class Login(
    private val repositoryAuthToken: AuthTokenRepository
    , private val getAccountByEmailQuery: Query<String, Account?>
    , private val newAccountCommand: Command<Account>
    , private val loginSuccessPublisher: Publisher<AuthToken>
    , private val loginGateway: Gateway<Credentials, AuthToken?>
) : Command<Credentials> {

    override suspend fun execute(input: Credentials) {
        try {
            val result: AuthToken? = loginGateway.call(input)
            result?.let {
                repositoryAuthToken.deleteAllForAccount(it.accountId)
                repositoryAuthToken.insert(it)
                if (getAccountByEmailQuery.execute(input.subject) == null) {
                    newAccountCommand.execute(Account(it.accountId, input.subject))
                }

                result.let { authToken ->
                    this.loginSuccessPublisher.publish(Event(authToken))
                }
            }
        } catch (e: Exception) {
            val localAccount: Account? = getAccountByEmailQuery.execute(input.subject)
            localAccount?.also {
                repositoryAuthToken.deleteAllForAccount(it.id)
            }
        }
    }
}