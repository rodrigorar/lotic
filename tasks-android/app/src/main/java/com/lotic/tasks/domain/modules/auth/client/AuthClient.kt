package com.lotic.tasks.domain.modules.auth.client

import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

const val BASE_URL: String = "auth"

interface AuthClient {

    @POST("$BASE_URL/login") // FIXME: We should use a Request POKO not a DTO
    suspend fun login(@Body credentials: Credentials): AuthToken

    @POST("$BASE_URL/logout")
    suspend fun logout(@Body request: AccountIdRequest)
}