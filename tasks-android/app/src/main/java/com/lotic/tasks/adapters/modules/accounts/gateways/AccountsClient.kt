package com.lotic.tasks.adapters.modules.accounts.gateways

import com.lotic.tasks.adapters.modules.accounts.gateways.payloads.NewAccountRequest
import com.lotic.tasks.adapters.modules.accounts.gateways.payloads.NewAccountResponse
import retrofit2.http.Body
import retrofit2.http.POST

const val ACCOUNTS_URL: String = "accounts"

interface AccountsClient {

    @POST(ACCOUNTS_URL)
    suspend fun newAccount(@Body request: NewAccountRequest): NewAccountResponse
}