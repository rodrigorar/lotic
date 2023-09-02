package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.domain.modules.auth.AuthToken

class RefreshGateway : RetrofitAuthGateway<AuthToken, AuthToken?>() {

    override suspend fun call(payload: AuthToken): AuthToken? {
        return this.authClient
            ?.refresh(payload.refreshToken.value)
            ?.toDTO()
    }
}