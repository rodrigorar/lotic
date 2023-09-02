package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.adapters.modules.auth.gateways.payloads.AuthTokenResponse
import com.lotic.tasks.adapters.modules.auth.gateways.payloads.LoginRequest
import com.lotic.tasks.domain.modules.auth.AuthToken
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.POST
import retrofit2.http.Path

const val AUTH_URL: String = "auth"

interface AuthClient {

    @POST("$AUTH_URL/login")
    suspend fun login(@Body credentials: LoginRequest): AuthTokenResponse

    @POST("$AUTH_URL/refresh/{refresh_token}")
    suspend fun refresh(@Path("refresh_token") refreshToken: String): AuthTokenResponse

    @DELETE("$AUTH_URL/{access_token}")
    suspend fun logout(@Path("access_token") accessToken: String): Response<Unit>
}