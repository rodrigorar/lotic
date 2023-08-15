package com.lotic.tasks.adapters.modules.auth.gateways

import java.util.*

class LogoutGateway : RetrofitGateway<UUID, Unit>() {
    override suspend fun call(payload: UUID) {
        this.authClient?.logout(AccountIdRequest(payload))
    }
}