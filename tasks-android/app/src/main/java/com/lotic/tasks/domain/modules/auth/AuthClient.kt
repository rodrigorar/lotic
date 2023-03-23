package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

const val BASE_URL: String = "/auth"

interface AuthClient {

    @POST("$BASE_URL/login")
    fun login(@Body credentials: Credentials): Call<AuthToken>

    @POST("$BASE_URL/refresh/{refreshToken}")
    fun refresh(@Path("refreshToken") refreshToken: String): Call<AuthToken>

    @POST("$BASE_URL/logout")
    fun logout(@Body account_id: String): Call<Unit>
}