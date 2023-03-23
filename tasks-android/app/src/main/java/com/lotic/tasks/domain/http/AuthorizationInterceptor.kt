package com.lotic.tasks.domain.http

import android.util.Log
import com.lotic.tasks.domain.modules.auth.AuthTokenProvider
import okhttp3.Interceptor
import okhttp3.Response

class AuthorizationInterceptor(private val authTokenProvider: AuthTokenProvider) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val accessToken = this.authTokenProvider.execute().token
        val updatedRequest = chain.request()
            .newBuilder()
            .header("Authorization", accessToken)
            .build()
        Log.d("AuthorizationInterceptor", "Authorizing with token: $accessToken")
        return chain.proceed(updatedRequest)
    }

}