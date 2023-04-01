package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.accounts.dto.Account
import com.lotic.tasks.domain.modules.auth.AuthClient
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
        } catch (e: Exception) {
            val localAccount: Account? = getAccountByEmailQuery.execute(input.subject)
            localAccount?.also {
                repositoryAuthToken.deleteAllForAccount(it.id)
            }
        }
    }
}