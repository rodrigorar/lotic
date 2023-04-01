package com.lotic.tasks.domain.http

import android.util.Log
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthorizationInterceptor(private val authTokenProvider: CurrentActiveAuthSessionProvider) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        Log.d("AuthorizationInterceptor", chain.request().url().toString())

        var updatedRequest = chain.request()
        if (! chain.request().url().toString().contains("auth", ignoreCase = true)) {
            Log.d("SynchManager", "Not logging in")
            val authToken: AuthToken? = runBlocking { authTokenProvider.get() }
            Log.d("SynchManager", authToken?.token ?: "")
             updatedRequest = chain.request()
                .newBuilder()
                .header("X-Authorization", authToken?.token ?: "")
                .build()
        }
        return chain.proceed(updatedRequest)
    }

}