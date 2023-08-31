package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.domain.modules.auth.AuthToken

class LogoutGateway : RetrofitAuthGateway<AuthToken, Unit>() {
    override suspend fun call(payload: AuthToken) {
        this.authClient?.logout(payload.token.value)
    }
}