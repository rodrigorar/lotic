package com.lotic.tasks.domain.http

import android.util.Log
import com.google.gson.Gson
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response

class AuthorizationInterceptor(private val authTokenProvider: CurrentActiveAuthSessionProvider) : Interceptor {

    private fun buildAuthorizedRequest(chain: Interceptor.Chain, authToken: AuthToken): Request {
        return chain.request()
            .newBuilder()
            .header("X-Authorization", authToken.token)
            .build()
    }

    private fun isAuthorizationNecessary(chain: Interceptor.Chain): Boolean {
        return ! chain.request().url().toString().contains("auth", ignoreCase = true)
                || chain.request().url().toString().contains("logout", ignoreCase = true)
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        var updatedRequest = chain.request()
        Log.d("AuthorizationInterceptor", Gson().toJson(chain.request()))
        if (isAuthorizationNecessary(chain)) {
            runBlocking { authTokenProvider.get() }
                ?.also { authToken ->
                    updatedRequest = buildAuthorizedRequest(chain, authToken)
                    var response = chain.proceed(updatedRequest)

                    if (response.code() == 401) {
                        val refreshOperation = AuthOperationsProvider.refresh()
                        runBlocking { refreshOperation.execute(authToken) }

                        // Try the request again with new authorization
                        runBlocking { authTokenProvider.get() }
                            ?.also { refreshedToken ->
                                updatedRequest = buildAuthorizedRequest(chain, refreshedToken)
                                response.close() // Close previous response, no longer needed
                                response = chain.proceed(updatedRequest)
                            }
                    }

                    return response
                }
        }
        return chain.proceed(updatedRequest)
    }

}