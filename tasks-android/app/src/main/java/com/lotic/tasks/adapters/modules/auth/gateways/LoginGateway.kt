package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.adapters.modules.auth.gateways.payloads.LoginRequest
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.Credentials

class LoginGateway : RetrofitAuthGateway<Credentials, AuthToken?>() {

    override suspend fun call(payload: Credentials): AuthToken? {
        return this.authClient
            ?.login(LoginRequest.from(payload))
            ?.toDTO()
    }
}