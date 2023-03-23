package com.lotic.tasks.domain.modules.auth

import android.util.Log
import com.lotic.tasks.domain.http.RetrofitClientProvider
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.shared.Consumer

class Login() : Consumer<Credentials> {
    override fun execute(input: Credentials) {
        Log.d("Login", "Login operation has been called")

        val authClient: AuthClient? = RetrofitClientProvider.execute()?.create(AuthClient::class.java)
        // TODO: Remove the credentials from here
        authClient?.login(Credentials("rodrigo.ra.rosa@gmail.com", "104k3dv-rosa"))
    }
}