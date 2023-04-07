package com.lotic.tasks.domain.http

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthorizationInterceptor(private val authTokenProvider: CurrentActiveAuthSessionProvider) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        var updatedRequest = chain.request()
        if (! chain.request().url().toString().contains("auth", ignoreCase = true)
            || chain.request().url().toString().contains("logout", ignoreCase = true)) {
            val authToken: AuthToken? = runBlocking { authTokenProvider.get() }
             updatedRequest = chain.request()
                .newBuilder()
                .header("X-Authorization", authToken?.token ?: "")
                .build()
        }
        return chain.proceed(updatedRequest)
    }

}