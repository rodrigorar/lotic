package com.lotic.tasks.domain.modules.auth.operations

import android.content.Context
import android.util.Log
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.AuthClient
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.shared.Consumer
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.persistence.TasksDatabase

class Login(private val repositoryAuthToken: RepositoryAuthToken) : Consumer<Credentials> {

    override suspend fun execute(input: Credentials) {
        val authClient: AuthClient? = RetrofitClientProvider.execute()?.create(AuthClient::class.java)
        // TODO: Remove the credentials from here
        val result: AuthToken? = authClient?.login(Credentials("rodrigo.ra.rosa@gmail.com", "104k3dv-rosa"))
        result?.also {
            repositoryAuthToken.insert(result)
        }
        Log.d("Login", "After calling the auth client operation")
        Log.d("Login", result?.toString().orEmpty())
    }
}