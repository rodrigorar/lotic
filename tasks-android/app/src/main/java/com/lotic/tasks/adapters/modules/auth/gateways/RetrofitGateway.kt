package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.adapters.http.RetrofitClientProvider
import com.lotic.tasks.domain.shared.Gateway

abstract class RetrofitGateway<I, O> : Gateway<I, O> {
    protected val authClient: AuthClient? = RetrofitClientProvider.get()?.create(AuthClient::class.java);
}