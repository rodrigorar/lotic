package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.AuthClient
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.shared.Consumer
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken

class Login(private val repositoryAuthToken: RepositoryAuthToken) : Consumer<Credentials> {

    override suspend fun execute(input: Credentials) {
        val authClient: AuthClient? = RetrofitClientProvider.execute()?.create(AuthClient::class.java)

        val result: AuthToken? = authClient?.login(input)
        result?.also {
            repositoryAuthToken.deleteAllForAccount(it.accountId)
            repositoryAuthToken.insert(it)
        }
    }
}