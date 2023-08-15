package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.Credentials
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

const val AUTH_URL: String = "auth"

interface AuthClient {

    @POST("$AUTH_URL/login") // FIXME: We should use a Request POKO not a DTO
    suspend fun login(@Body credentials: Credentials): AuthToken

    @POST("$AUTH_URL/refresh/{refresh_token}")
    suspend fun refresh(@Path("refresh_token") refreshToken: String): AuthToken

    @POST("$AUTH_URL/logout")
    suspend fun logout(@Body request: AccountIdRequest): Response<Unit>
}