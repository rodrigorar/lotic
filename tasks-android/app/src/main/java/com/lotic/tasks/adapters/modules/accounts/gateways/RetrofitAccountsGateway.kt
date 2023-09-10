package com.lotic.tasks.adapters.modules.accounts.gateways

import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.domain.shared.Gateway

abstract class RetrofitAccountsGateway<I, O> : Gateway<I, O> {
    protected val accountsClient: AccountsClient? = RetrofitClientProvider.get()?.create(AccountsClient::class.java)
}