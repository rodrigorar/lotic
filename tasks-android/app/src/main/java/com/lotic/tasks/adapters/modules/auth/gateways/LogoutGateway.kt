package com.lotic.tasks.adapters.modules.auth.gateways

import com.lotic.tasks.adapters.modules.auth.gateways.payloads.AccountIdRequest
import java.util.*

class LogoutGateway : RetrofitAuthGateway<UUID, Unit>() {
    override suspend fun call(payload: UUID) {
        this.authClient?.logout(AccountIdRequest(payload))
    }
}