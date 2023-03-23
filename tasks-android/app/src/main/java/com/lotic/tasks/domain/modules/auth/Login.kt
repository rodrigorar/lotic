package com.lotic.tasks.domain.modules.auth

import android.util.Log
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.shared.Consumer

class Login() : Consumer<Credentials> {
    override suspend fun execute(input: Credentials) {
        val authClient: AuthClient? = RetrofitClientProvider.execute()?.create(AuthClient::class.java)
        // TODO: Remove the credentials from here
        val result: AuthToken? = authClient?.login(Credentials("rodrigo.ra.rosa@gmail.com", "104k3dv-rosa"))
        Log.d("Login", "After calling the auth client operation")
        Log.d("Login", result?.toString().orEmpty())
    }
}