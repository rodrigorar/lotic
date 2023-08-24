package com.lotic.tasks.adapters.modules.auth.gateways.payloads

import com.google.gson.annotations.SerializedName
import java.util.*

data class AccountIdRequest(
    @SerializedName("account_id") val accountId: UUID
)
